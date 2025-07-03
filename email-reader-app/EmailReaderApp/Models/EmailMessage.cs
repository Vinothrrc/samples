using MimeKit;

namespace EmailReaderApp.Models;

/// <summary>
/// Represents an email message with its content and attachments
/// </summary>
public class EmailMessage
{
    /// <summary>
    /// Unique identifier for the email
    /// </summary>
    public string Id { get; set; } = string.Empty;

    /// <summary>
    /// Email subject
    /// </summary>
    public string Subject { get; set; } = string.Empty;

    /// <summary>
    /// Sender's email address and display name
    /// </summary>
    public EmailAddress From { get; set; } = new();

    /// <summary>
    /// List of recipients (To field)
    /// </summary>
    public List<EmailAddress> To { get; set; } = new();

    /// <summary>
    /// List of CC recipients
    /// </summary>
    public List<EmailAddress> Cc { get; set; } = new();

    /// <summary>
    /// List of BCC recipients (when available)
    /// </summary>
    public List<EmailAddress> Bcc { get; set; } = new();

    /// <summary>
    /// Email body as plain text
    /// </summary>
    public string BodyText { get; set; } = string.Empty;

    /// <summary>
    /// Email body as HTML
    /// </summary>
    public string BodyHtml { get; set; } = string.Empty;

    /// <summary>
    /// Date when the email was sent
    /// </summary>
    public DateTimeOffset DateSent { get; set; }

    /// <summary>
    /// Date when the email was received
    /// </summary>
    public DateTimeOffset DateReceived { get; set; }

    /// <summary>
    /// Email priority/importance
    /// </summary>
    public MessagePriority Priority { get; set; } = MessagePriority.Normal;

    /// <summary>
    /// Indicates if the email has been read
    /// </summary>
    public bool IsRead { get; set; }

    /// <summary>
    /// Indicates if the email is marked as important
    /// </summary>
    public bool IsImportant { get; set; }

    /// <summary>
    /// List of attachments
    /// </summary>
    public List<EmailAttachment> Attachments { get; set; } = new();

    /// <summary>
    /// Email headers for advanced analysis
    /// </summary>
    public Dictionary<string, string> Headers { get; set; } = new();

    /// <summary>
    /// Message size in bytes
    /// </summary>
    public long SizeInBytes { get; set; }

    /// <summary>
    /// Indicates if the email has attachments
    /// </summary>
    public bool HasAttachments => Attachments.Any();

    /// <summary>
    /// Gets the total number of attachments
    /// </summary>
    public int AttachmentCount => Attachments.Count;

    /// <summary>
    /// Gets the total size of all attachments in bytes
    /// </summary>
    public long TotalAttachmentSize => Attachments.Sum(a => a.SizeInBytes);
}

/// <summary>
/// Represents an email address with display name
/// </summary>
public class EmailAddress
{
    /// <summary>
    /// Email address (e.g., user@example.com)
    /// </summary>
    public string Address { get; set; } = string.Empty;

    /// <summary>
    /// Display name (e.g., "John Doe")
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Full formatted address (e.g., "John Doe <user@example.com>")
    /// </summary>
    public string FullAddress => string.IsNullOrWhiteSpace(Name) ? Address : $"{Name} <{Address}>";

    public override string ToString() => FullAddress;
}

/// <summary>
/// Represents an email attachment
/// </summary>
public class EmailAttachment
{
    /// <summary>
    /// Attachment filename
    /// </summary>
    public string FileName { get; set; } = string.Empty;

    /// <summary>
    /// MIME content type (e.g., "application/pdf", "image/jpeg")
    /// </summary>
    public string ContentType { get; set; } = string.Empty;

    /// <summary>
    /// Attachment size in bytes
    /// </summary>
    public long SizeInBytes { get; set; }

    /// <summary>
    /// Content-ID for inline attachments (when applicable)
    /// </summary>
    public string? ContentId { get; set; }

    /// <summary>
    /// Indicates if this is an inline attachment
    /// </summary>
    public bool IsInline { get; set; }

    /// <summary>
    /// Local file path where the attachment was saved
    /// </summary>
    public string? SavedFilePath { get; set; }

    /// <summary>
    /// Indicates if the attachment was successfully downloaded
    /// </summary>
    public bool IsDownloaded { get; set; }

    /// <summary>
    /// Error message if download failed
    /// </summary>
    public string? DownloadError { get; set; }

    /// <summary>
    /// Raw attachment data (use carefully for memory management)
    /// </summary>
    public byte[]? Data { get; set; }

    /// <summary>
    /// Gets the file size in a human-readable format
    /// </summary>
    public string FormattedSize
    {
        get
        {
            if (SizeInBytes < 1024) return $"{SizeInBytes} B";
            if (SizeInBytes < 1024 * 1024) return $"{SizeInBytes / 1024.0:F1} KB";
            if (SizeInBytes < 1024 * 1024 * 1024) return $"{SizeInBytes / (1024.0 * 1024.0):F1} MB";
            return $"{SizeInBytes / (1024.0 * 1024.0 * 1024.0):F1} GB";
        }
    }

    /// <summary>
    /// Gets the file extension from the filename
    /// </summary>
    public string FileExtension => Path.GetExtension(FileName).ToLowerInvariant();
}