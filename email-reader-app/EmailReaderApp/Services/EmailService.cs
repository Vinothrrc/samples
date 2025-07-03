using EmailReaderApp.Models;
using MailKit;
using MailKit.Net.Imap;
using MailKit.Net.Pop3;
using MailKit.Search;
using Microsoft.Extensions.Logging;
using MimeKit;
using System.Text;

namespace EmailReaderApp.Services;

/// <summary>
/// Production-ready email service implementation supporting IMAP and POP3 protocols
/// </summary>
public class EmailService : IEmailService
{
    private readonly ILogger<EmailService> _logger;
    private readonly EmailConfiguration _configuration;
    private IMailService? _mailClient;
    private IMailFolder? _currentFolder;
    private bool _disposed = false;

    public EmailService(ILogger<EmailService> logger, EmailConfiguration configuration)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));

        if (!_configuration.IsValid(out var errors))
        {
            var errorMessage = string.Join(", ", errors);
            _logger.LogError("Invalid email configuration: {Errors}", errorMessage);
            throw new ArgumentException($"Invalid email configuration: {errorMessage}");
        }
    }

    public EmailConfiguration Configuration => _configuration;

    public bool IsConnected => _mailClient?.IsConnected == true;

    public async Task<bool> ConnectAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Connecting to {Protocol} server {Host}:{Port}", _configuration.Protocol, _configuration.Host, _configuration.Port);

            await DisconnectAsync(cancellationToken);

            _mailClient = _configuration.Protocol switch
            {
                EmailProtocol.IMAP => new ImapClient(),
                EmailProtocol.POP3 => new Pop3Client(),
                _ => throw new NotSupportedException($"Protocol {_configuration.Protocol} is not supported")
            };

            _mailClient.Timeout = _configuration.TimeoutSeconds * 1000;

            await _mailClient.ConnectAsync(_configuration.Host, _configuration.Port, _configuration.UseSsl, cancellationToken);
            await _mailClient.AuthenticateAsync(_configuration.Username, _configuration.Password, cancellationToken);

            if (_configuration.Protocol == EmailProtocol.IMAP && _mailClient is ImapClient imapClient)
            {
                _currentFolder = await imapClient.GetFolderAsync(_configuration.FolderName, cancellationToken);
                await _currentFolder.OpenAsync(FolderAccess.ReadOnly, cancellationToken);
            }

            _logger.LogInformation("Successfully connected to {Protocol} server", _configuration.Protocol);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to connect to {Protocol} server {Host}:{Port}", 
                _configuration.Protocol, _configuration.Host, _configuration.Port);
            return false;
        }
    }

    public async Task DisconnectAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            if (_mailClient?.IsConnected == true)
            {
                await _mailClient.DisconnectAsync(true, cancellationToken);
                _logger.LogInformation("Disconnected from email server");
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error during disconnection");
        }
        finally
        {
            _mailClient?.Dispose();
            _mailClient = null;
            _currentFolder = null;
        }
    }

    public async Task<bool> TestConnectionAsync(CancellationToken cancellationToken = default)
    {
        var testClient = _configuration.Protocol switch
        {
            EmailProtocol.IMAP => new ImapClient() as IMailService,
            EmailProtocol.POP3 => new Pop3Client() as IMailService,
            _ => throw new NotSupportedException($"Protocol {_configuration.Protocol} is not supported")
        };

        try
        {
            testClient.Timeout = _configuration.TimeoutSeconds * 1000;
            await testClient.ConnectAsync(_configuration.Host, _configuration.Port, _configuration.UseSsl, cancellationToken);
            await testClient.AuthenticateAsync(_configuration.Username, _configuration.Password, cancellationToken);
            await testClient.DisconnectAsync(true, cancellationToken);
            
            _logger.LogInformation("Connection test successful");
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Connection test failed");
            return false;
        }
        finally
        {
            testClient.Dispose();
        }
    }

    public async Task<List<EmailMessage>> GetEmailsAsync(int count = 0, int skipCount = 0, CancellationToken cancellationToken = default)
    {
        if (!IsConnected)
        {
            _logger.LogWarning("Not connected to email server");
            return new List<EmailMessage>();
        }

        try
        {
            var emails = new List<EmailMessage>();
            var effectiveCount = count > 0 ? Math.Min(count, _configuration.MaxEmailsToRetrieve) : _configuration.MaxEmailsToRetrieve;

            if (_configuration.Protocol == EmailProtocol.IMAP && _currentFolder != null)
            {
                await ProcessImapEmails(emails, effectiveCount, skipCount, cancellationToken);
            }
            else if (_configuration.Protocol == EmailProtocol.POP3 && _mailClient is Pop3Client pop3Client)
            {
                await ProcessPop3Emails(pop3Client, emails, effectiveCount, skipCount, cancellationToken);
            }

            _logger.LogInformation("Retrieved {Count} emails", emails.Count);
            return emails;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve emails");
            return new List<EmailMessage>();
        }
    }

    public async Task<EmailMessage?> GetEmailByIdAsync(string messageId, CancellationToken cancellationToken = default)
    {
        if (!IsConnected || string.IsNullOrEmpty(messageId))
        {
            return null;
        }

        try
        {
            if (_configuration.Protocol == EmailProtocol.IMAP && _currentFolder != null)
            {
                var query = SearchQuery.HeaderContains("Message-ID", messageId);
                var uids = await _currentFolder.SearchAsync(query, cancellationToken);
                
                if (uids.Count > 0)
                {
                    var message = await _currentFolder.GetMessageAsync(uids[0], cancellationToken);
                    return await ConvertToEmailMessage(message, uids[0].ToString(), cancellationToken);
                }
            }
            else if (_configuration.Protocol == EmailProtocol.POP3 && _mailClient is Pop3Client pop3Client)
            {
                for (int i = 0; i < pop3Client.Count; i++)
                {
                    var message = await pop3Client.GetMessageAsync(i, cancellationToken);
                    if (message.MessageId == messageId)
                    {
                        return await ConvertToEmailMessage(message, i.ToString(), cancellationToken);
                    }
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve email by ID: {MessageId}", messageId);
        }

        return null;
    }

    public async Task<List<EmailMessage>> GetEmailsSinceAsync(DateTimeOffset since, CancellationToken cancellationToken = default)
    {
        if (!IsConnected)
        {
            return new List<EmailMessage>();
        }

        try
        {
            var emails = new List<EmailMessage>();

            if (_configuration.Protocol == EmailProtocol.IMAP && _currentFolder != null)
            {
                var query = SearchQuery.DeliveredAfter(since.DateTime);
                var uids = await _currentFolder.SearchAsync(query, cancellationToken);
                
                foreach (var uid in uids.Take(_configuration.MaxEmailsToRetrieve))
                {
                    var message = await _currentFolder.GetMessageAsync(uid, cancellationToken);
                    var emailMessage = await ConvertToEmailMessage(message, uid.ToString(), cancellationToken);
                    emails.Add(emailMessage);
                }
            }
            else if (_configuration.Protocol == EmailProtocol.POP3 && _mailClient is Pop3Client pop3Client)
            {
                for (int i = 0; i < Math.Min(pop3Client.Count, _configuration.MaxEmailsToRetrieve); i++)
                {
                    var message = await pop3Client.GetMessageAsync(i, cancellationToken);
                    if (message.Date >= since)
                    {
                        var emailMessage = await ConvertToEmailMessage(message, i.ToString(), cancellationToken);
                        emails.Add(emailMessage);
                    }
                }
            }

            _logger.LogInformation("Retrieved {Count} emails since {Date}", emails.Count, since);
            return emails;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve emails since {Date}", since);
            return new List<EmailMessage>();
        }
    }

    public async Task<List<EmailMessage>> SearchEmailsAsync(EmailSearchCriteria searchCriteria, CancellationToken cancellationToken = default)
    {
        if (!IsConnected || searchCriteria == null)
        {
            return new List<EmailMessage>();
        }

        try
        {
            var emails = new List<EmailMessage>();

            if (_configuration.Protocol == EmailProtocol.IMAP && _currentFolder != null)
            {
                var query = BuildSearchQuery(searchCriteria);
                var uids = await _currentFolder.SearchAsync(query, cancellationToken);
                
                var limitedUids = uids.Take(searchCriteria.MaxResults ?? _configuration.MaxEmailsToRetrieve);
                
                foreach (var uid in limitedUids)
                {
                    var message = await _currentFolder.GetMessageAsync(uid, cancellationToken);
                    var emailMessage = await ConvertToEmailMessage(message, uid.ToString(), cancellationToken);
                    emails.Add(emailMessage);
                }
            }
            else
            {
                // POP3 doesn't support server-side search, so we need to download and filter
                var allEmails = await GetEmailsAsync(searchCriteria.MaxResults ?? _configuration.MaxEmailsToRetrieve, 0, cancellationToken);
                emails = FilterEmailsBySearchCriteria(allEmails, searchCriteria);
            }

            _logger.LogInformation("Search returned {Count} emails", emails.Count);
            return emails;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to search emails");
            return new List<EmailMessage>();
        }
    }

    public async Task<bool> DownloadAttachmentAsync(EmailAttachment attachment, string saveDirectory, CancellationToken cancellationToken = default)
    {
        try
        {
            if (attachment.Data == null || attachment.Data.Length == 0)
            {
                _logger.LogWarning("No attachment data available for {FileName}", attachment.FileName);
                return false;
            }

            var maxSizeBytes = _configuration.MaxAttachmentSizeMB * 1024 * 1024;
            if (attachment.SizeInBytes > maxSizeBytes)
            {
                _logger.LogWarning("Attachment {FileName} exceeds maximum size limit", attachment.FileName);
                attachment.DownloadError = "File exceeds maximum size limit";
                return false;
            }

            Directory.CreateDirectory(saveDirectory);
            
            var fileName = SanitizeFileName(attachment.FileName);
            var filePath = Path.Combine(saveDirectory, fileName);
            
            // Handle duplicate filenames
            var counter = 1;
            var originalFilePath = filePath;
            while (File.Exists(filePath))
            {
                var directory = Path.GetDirectoryName(originalFilePath)!;
                var nameWithoutExtension = Path.GetFileNameWithoutExtension(originalFilePath);
                var extension = Path.GetExtension(originalFilePath);
                filePath = Path.Combine(directory, $"{nameWithoutExtension}_{counter}{extension}");
                counter++;
            }

            await File.WriteAllBytesAsync(filePath, attachment.Data, cancellationToken);
            
            attachment.SavedFilePath = filePath;
            attachment.IsDownloaded = true;
            
            _logger.LogInformation("Downloaded attachment {FileName} to {FilePath}", attachment.FileName, filePath);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to download attachment {FileName}", attachment.FileName);
            attachment.DownloadError = ex.Message;
            return false;
        }
    }

    public async Task<int> DownloadAllAttachmentsAsync(EmailMessage emailMessage, string saveDirectory, CancellationToken cancellationToken = default)
    {
        var successCount = 0;
        
        foreach (var attachment in emailMessage.Attachments)
        {
            if (await DownloadAttachmentAsync(attachment, saveDirectory, cancellationToken))
            {
                successCount++;
            }
        }

        _logger.LogInformation("Downloaded {SuccessCount}/{TotalCount} attachments from email {Subject}", 
            successCount, emailMessage.Attachments.Count, emailMessage.Subject);
        
        return successCount;
    }

    public async Task<List<string>> GetFoldersAsync(CancellationToken cancellationToken = default)
    {
        if (_configuration.Protocol != EmailProtocol.IMAP || !IsConnected || _mailClient is not ImapClient imapClient)
        {
            return new List<string>();
        }

        try
        {
            var folders = await imapClient.GetFoldersAsync(imapClient.PersonalNamespaces[0], cancellationToken: cancellationToken);
            var folderNames = folders.Select(f => f.FullName).ToList();
            
            _logger.LogInformation("Retrieved {Count} folders", folderNames.Count);
            return folderNames;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve folders");
            return new List<string>();
        }
    }

    public async Task<bool> SelectFolderAsync(string folderName, CancellationToken cancellationToken = default)
    {
        if (_configuration.Protocol != EmailProtocol.IMAP || !IsConnected || _mailClient is not ImapClient imapClient)
        {
            return false;
        }

        try
        {
            _currentFolder = await imapClient.GetFolderAsync(folderName, cancellationToken);
            await _currentFolder.OpenAsync(FolderAccess.ReadOnly, cancellationToken);
            
            _logger.LogInformation("Selected folder: {FolderName}", folderName);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to select folder: {FolderName}", folderName);
            return false;
        }
    }

    public Task<int> GetMessageCountAsync(CancellationToken cancellationToken = default)
    {
        if (!IsConnected)
            return Task.FromResult(0);

        try
        {
            if (_configuration.Protocol == EmailProtocol.IMAP && _currentFolder != null)
            {
                return Task.FromResult(_currentFolder.Count);
            }
            else if (_configuration.Protocol == EmailProtocol.POP3 && _mailClient is Pop3Client pop3Client)
            {
                return Task.FromResult(pop3Client.Count);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get message count");
        }

        return Task.FromResult(0);
    }

    public async Task<int> GetUnreadCountAsync(CancellationToken cancellationToken = default)
    {
        if (_configuration.Protocol != EmailProtocol.IMAP || !IsConnected || _currentFolder == null)
        {
            return 0;
        }

        try
        {
            var query = SearchQuery.NotSeen;
            var uids = await _currentFolder.SearchAsync(query, cancellationToken);
            return uids.Count;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get unread count");
            return 0;
        }
    }

    public async Task<bool> MarkAsReadAsync(string messageId, CancellationToken cancellationToken = default)
    {
        if (_configuration.Protocol != EmailProtocol.IMAP || !IsConnected || _currentFolder == null)
        {
            return false;
        }

        try
        {
            if (_currentFolder.Access == FolderAccess.ReadOnly)
            {
                await _currentFolder.OpenAsync(FolderAccess.ReadWrite, cancellationToken);
            }

            var query = SearchQuery.HeaderContains("Message-ID", messageId);
            var uids = await _currentFolder.SearchAsync(query, cancellationToken);
            
            if (uids.Count > 0)
            {
                await _currentFolder.AddFlagsAsync(uids, MessageFlags.Seen, true, cancellationToken);
                return true;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to mark message as read: {MessageId}", messageId);
        }

        return false;
    }

    public async Task<bool> MarkAsUnreadAsync(string messageId, CancellationToken cancellationToken = default)
    {
        if (_configuration.Protocol != EmailProtocol.IMAP || !IsConnected || _currentFolder == null)
        {
            return false;
        }

        try
        {
            if (_currentFolder.Access == FolderAccess.ReadOnly)
            {
                await _currentFolder.OpenAsync(FolderAccess.ReadWrite, cancellationToken);
            }

            var query = SearchQuery.HeaderContains("Message-ID", messageId);
            var uids = await _currentFolder.SearchAsync(query, cancellationToken);
            
            if (uids.Count > 0)
            {
                await _currentFolder.RemoveFlagsAsync(uids, MessageFlags.Seen, true, cancellationToken);
                return true;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to mark message as unread: {MessageId}", messageId);
        }

        return false;
    }

    private async Task ProcessImapEmails(List<EmailMessage> emails, int count, int skipCount, CancellationToken cancellationToken)
    {
        if (_currentFolder == null) return;

        var totalMessages = _currentFolder.Count;
        var startIndex = Math.Max(0, totalMessages - count - skipCount);
        var endIndex = Math.Max(0, totalMessages - skipCount);

        for (int i = endIndex - 1; i >= startIndex; i--)
        {
            try
            {
                var message = await _currentFolder.GetMessageAsync(i, cancellationToken);
                var emailMessage = await ConvertToEmailMessage(message, i.ToString(), cancellationToken);
                emails.Add(emailMessage);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to process email at index {Index}", i);
            }
        }
    }

    private async Task ProcessPop3Emails(Pop3Client pop3Client, List<EmailMessage> emails, int count, int skipCount, CancellationToken cancellationToken)
    {
        var totalMessages = pop3Client.Count;
        var startIndex = Math.Max(0, totalMessages - count - skipCount);
        var endIndex = Math.Max(0, totalMessages - skipCount);

        for (int i = endIndex - 1; i >= startIndex; i--)
        {
            try
            {
                var message = await pop3Client.GetMessageAsync(i, cancellationToken);
                var emailMessage = await ConvertToEmailMessage(message, i.ToString(), cancellationToken);
                emails.Add(emailMessage);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to process email at index {Index}", i);
            }
        }
    }

    private async Task<EmailMessage> ConvertToEmailMessage(MimeMessage mimeMessage, string id, CancellationToken cancellationToken)
    {
        var emailMessage = new EmailMessage
        {
            Id = id,
            Subject = mimeMessage.Subject ?? string.Empty,
            From = ConvertToEmailAddress(mimeMessage.From.FirstOrDefault()),
            To = mimeMessage.To.Select(ConvertToEmailAddress).ToList(),
            Cc = mimeMessage.Cc.Select(ConvertToEmailAddress).ToList(),
            Bcc = mimeMessage.Bcc.Select(ConvertToEmailAddress).ToList(),
            DateSent = mimeMessage.Date,
            DateReceived = mimeMessage.Date,
            Priority = mimeMessage.Priority,
            SizeInBytes = CalculateMessageSize(mimeMessage),
            Headers = mimeMessage.Headers.ToDictionary(h => h.Field, h => h.Value)
        };

        // Extract message body
        if (!string.IsNullOrEmpty(mimeMessage.TextBody))
        {
            emailMessage.BodyText = mimeMessage.TextBody;
        }

        if (!string.IsNullOrEmpty(mimeMessage.HtmlBody))
        {
            emailMessage.BodyHtml = mimeMessage.HtmlBody;
        }

        // Process attachments
        await ProcessAttachments(mimeMessage, emailMessage, cancellationToken);

        return emailMessage;
    }

    private EmailAddress ConvertToEmailAddress(InternetAddress? internetAddress)
    {
        if (internetAddress is MailboxAddress mailbox)
        {
            return new EmailAddress
            {
                Address = mailbox.Address,
                Name = mailbox.Name ?? string.Empty
            };
        }

        return new EmailAddress
        {
            Address = internetAddress?.ToString() ?? string.Empty,
            Name = string.Empty
        };
    }

    private async Task ProcessAttachments(MimeMessage mimeMessage, EmailMessage emailMessage, CancellationToken cancellationToken)
    {
        foreach (var attachment in mimeMessage.Attachments)
        {
            try
            {
                var emailAttachment = new EmailAttachment
                {
                    FileName = attachment.ContentDisposition?.FileName ?? "unknown",
                    ContentType = attachment.ContentType.MimeType,
                    IsInline = attachment.ContentDisposition?.Disposition == ContentDisposition.Inline,
                    ContentId = attachment.ContentId
                };

                if (attachment is MimePart mimePart)
                {
                    using var memory = new MemoryStream();
                    await mimePart.Content.DecodeToAsync(memory, cancellationToken);
                    emailAttachment.Data = memory.ToArray();
                    emailAttachment.SizeInBytes = emailAttachment.Data.Length;
                }

                emailMessage.Attachments.Add(emailAttachment);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to process attachment");
            }
        }
    }

    private long CalculateMessageSize(MimeMessage message)
    {
        using var stream = new MemoryStream();
        message.WriteTo(stream);
        return stream.Length;
    }

    private SearchQuery BuildSearchQuery(EmailSearchCriteria criteria)
    {
        var queries = new List<SearchQuery>();

        if (!string.IsNullOrEmpty(criteria.Subject))
            queries.Add(SearchQuery.SubjectContains(criteria.Subject));

        if (!string.IsNullOrEmpty(criteria.From))
            queries.Add(SearchQuery.FromContains(criteria.From));

        if (!string.IsNullOrEmpty(criteria.To))
            queries.Add(SearchQuery.ToContains(criteria.To));

        if (!string.IsNullOrEmpty(criteria.Body))
            queries.Add(SearchQuery.BodyContains(criteria.Body));

        if (criteria.SentAfter.HasValue)
            queries.Add(SearchQuery.SentSince(criteria.SentAfter.Value.DateTime));

        if (criteria.SentBefore.HasValue)
            queries.Add(SearchQuery.SentBefore(criteria.SentBefore.Value.DateTime));

        if (criteria.IsRead.HasValue)
            queries.Add(criteria.IsRead.Value ? SearchQuery.Seen : SearchQuery.NotSeen);

        return queries.Count switch
        {
            0 => SearchQuery.All,
            1 => queries[0],
            _ => queries.Aggregate(SearchQuery.And)
        };
    }

    private List<EmailMessage> FilterEmailsBySearchCriteria(List<EmailMessage> emails, EmailSearchCriteria criteria)
    {
        return emails.Where(email =>
        {
            if (!string.IsNullOrEmpty(criteria.Subject) && 
                !email.Subject.Contains(criteria.Subject, StringComparison.OrdinalIgnoreCase))
                return false;

            if (!string.IsNullOrEmpty(criteria.From) && 
                !email.From.Address.Contains(criteria.From, StringComparison.OrdinalIgnoreCase))
                return false;

            if (!string.IsNullOrEmpty(criteria.To) && 
                !email.To.Any(to => to.Address.Contains(criteria.To, StringComparison.OrdinalIgnoreCase)))
                return false;

            if (!string.IsNullOrEmpty(criteria.Body) && 
                !email.BodyText.Contains(criteria.Body, StringComparison.OrdinalIgnoreCase) &&
                !email.BodyHtml.Contains(criteria.Body, StringComparison.OrdinalIgnoreCase))
                return false;

            if (criteria.SentAfter.HasValue && email.DateSent < criteria.SentAfter.Value)
                return false;

            if (criteria.SentBefore.HasValue && email.DateSent > criteria.SentBefore.Value)
                return false;

            if (criteria.IsRead.HasValue && email.IsRead != criteria.IsRead.Value)
                return false;

            if (criteria.HasAttachments.HasValue && email.HasAttachments != criteria.HasAttachments.Value)
                return false;

            return true;
        }).ToList();
    }

    private static string SanitizeFileName(string fileName)
    {
        var invalidChars = Path.GetInvalidFileNameChars();
        var sanitized = new StringBuilder();

        foreach (var c in fileName)
        {
            if (!invalidChars.Contains(c))
                sanitized.Append(c);
            else
                sanitized.Append('_');
        }

        return sanitized.ToString();
    }

    public void Dispose()
    {
        if (!_disposed)
        {
            DisconnectAsync().GetAwaiter().GetResult();
            _disposed = true;
        }
    }
}