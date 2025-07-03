using EmailReaderApp.Models;

namespace EmailReaderApp.Services;

/// <summary>
/// Service interface for email operations including reading emails and managing attachments
/// </summary>
public interface IEmailService : IDisposable
{
    /// <summary>
    /// Establishes a connection to the email server
    /// </summary>
    /// <param name="cancellationToken">Cancellation token for async operation</param>
    /// <returns>True if connection successful, false otherwise</returns>
    Task<bool> ConnectAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Disconnects from the email server
    /// </summary>
    /// <param name="cancellationToken">Cancellation token for async operation</param>
    Task DisconnectAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Tests the connection to the email server without establishing a persistent connection
    /// </summary>
    /// <param name="cancellationToken">Cancellation token for async operation</param>
    /// <returns>True if connection test successful, false otherwise</returns>
    Task<bool> TestConnectionAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves a list of email messages from the server
    /// </summary>
    /// <param name="count">Maximum number of emails to retrieve (0 = all available)</param>
    /// <param name="skipCount">Number of emails to skip from the beginning</param>
    /// <param name="cancellationToken">Cancellation token for async operation</param>
    /// <returns>List of email messages</returns>
    Task<List<EmailMessage>> GetEmailsAsync(int count = 0, int skipCount = 0, CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves a specific email message by its unique identifier
    /// </summary>
    /// <param name="messageId">Unique message identifier</param>
    /// <param name="cancellationToken">Cancellation token for async operation</param>
    /// <returns>Email message or null if not found</returns>
    Task<EmailMessage?> GetEmailByIdAsync(string messageId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves emails newer than the specified date
    /// </summary>
    /// <param name="since">Date threshold for filtering emails</param>
    /// <param name="cancellationToken">Cancellation token for async operation</param>
    /// <returns>List of email messages newer than the specified date</returns>
    Task<List<EmailMessage>> GetEmailsSinceAsync(DateTimeOffset since, CancellationToken cancellationToken = default);

    /// <summary>
    /// Searches for emails matching the specified criteria
    /// </summary>
    /// <param name="searchCriteria">Search criteria (subject, sender, etc.)</param>
    /// <param name="cancellationToken">Cancellation token for async operation</param>
    /// <returns>List of matching email messages</returns>
    Task<List<EmailMessage>> SearchEmailsAsync(EmailSearchCriteria searchCriteria, CancellationToken cancellationToken = default);

    /// <summary>
    /// Downloads and saves an attachment to the specified directory
    /// </summary>
    /// <param name="attachment">Attachment information</param>
    /// <param name="saveDirectory">Directory where the attachment should be saved</param>
    /// <param name="cancellationToken">Cancellation token for async operation</param>
    /// <returns>True if download successful, false otherwise</returns>
    Task<bool> DownloadAttachmentAsync(EmailAttachment attachment, string saveDirectory, CancellationToken cancellationToken = default);

    /// <summary>
    /// Downloads all attachments from an email message
    /// </summary>
    /// <param name="emailMessage">Email message containing attachments</param>
    /// <param name="saveDirectory">Directory where attachments should be saved</param>
    /// <param name="cancellationToken">Cancellation token for async operation</param>
    /// <returns>Number of successfully downloaded attachments</returns>
    Task<int> DownloadAllAttachmentsAsync(EmailMessage emailMessage, string saveDirectory, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the list of available folders (IMAP only)
    /// </summary>
    /// <param name="cancellationToken">Cancellation token for async operation</param>
    /// <returns>List of folder names</returns>
    Task<List<string>> GetFoldersAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Changes the current folder (IMAP only)
    /// </summary>
    /// <param name="folderName">Name of the folder to switch to</param>
    /// <param name="cancellationToken">Cancellation token for async operation</param>
    /// <returns>True if folder change successful, false otherwise</returns>
    Task<bool> SelectFolderAsync(string folderName, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the count of messages in the current folder
    /// </summary>
    /// <param name="cancellationToken">Cancellation token for async operation</param>
    /// <returns>Number of messages in the current folder</returns>
    Task<int> GetMessageCountAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the count of unread messages in the current folder
    /// </summary>
    /// <param name="cancellationToken">Cancellation token for async operation</param>
    /// <returns>Number of unread messages</returns>
    Task<int> GetUnreadCountAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Marks an email as read (IMAP only)
    /// </summary>
    /// <param name="messageId">Unique message identifier</param>
    /// <param name="cancellationToken">Cancellation token for async operation</param>
    /// <returns>True if operation successful, false otherwise</returns>
    Task<bool> MarkAsReadAsync(string messageId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Marks an email as unread (IMAP only)
    /// </summary>
    /// <param name="messageId">Unique message identifier</param>
    /// <param name="cancellationToken">Cancellation token for async operation</param>
    /// <returns>True if operation successful, false otherwise</returns>
    Task<bool> MarkAsUnreadAsync(string messageId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Indicates whether the service is currently connected to the email server
    /// </summary>
    bool IsConnected { get; }

    /// <summary>
    /// Gets the current email configuration
    /// </summary>
    EmailConfiguration Configuration { get; }
}

/// <summary>
/// Search criteria for filtering emails
/// </summary>
public class EmailSearchCriteria
{
    /// <summary>
    /// Search in email subject
    /// </summary>
    public string? Subject { get; set; }

    /// <summary>
    /// Search by sender email address
    /// </summary>
    public string? From { get; set; }

    /// <summary>
    /// Search by recipient email address
    /// </summary>
    public string? To { get; set; }

    /// <summary>
    /// Search in email body content
    /// </summary>
    public string? Body { get; set; }

    /// <summary>
    /// Filter by emails sent after this date
    /// </summary>
    public DateTimeOffset? SentAfter { get; set; }

    /// <summary>
    /// Filter by emails sent before this date
    /// </summary>
    public DateTimeOffset? SentBefore { get; set; }

    /// <summary>
    /// Filter by read status
    /// </summary>
    public bool? IsRead { get; set; }

    /// <summary>
    /// Filter by emails with attachments
    /// </summary>
    public bool? HasAttachments { get; set; }

    /// <summary>
    /// Maximum number of results to return
    /// </summary>
    public int? MaxResults { get; set; } = 100;
}