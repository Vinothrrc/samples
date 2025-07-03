namespace EmailReaderApp.Models;

/// <summary>
/// Configuration settings for email server connection
/// </summary>
public class EmailConfiguration
{
    /// <summary>
    /// Email server host (e.g., imap.gmail.com)
    /// </summary>
    public string Host { get; set; } = string.Empty;

    /// <summary>
    /// Server port (e.g., 993 for IMAP SSL, 995 for POP3 SSL)
    /// </summary>
    public int Port { get; set; }

    /// <summary>
    /// Email account username
    /// </summary>
    public string Username { get; set; } = string.Empty;

    /// <summary>
    /// Email account password or app-specific password
    /// </summary>
    public string Password { get; set; } = string.Empty;

    /// <summary>
    /// Use SSL/TLS encryption (recommended: true)
    /// </summary>
    public bool UseSsl { get; set; } = true;

    /// <summary>
    /// Email protocol: IMAP or POP3
    /// </summary>
    public EmailProtocol Protocol { get; set; } = EmailProtocol.IMAP;

    /// <summary>
    /// Folder name to read emails from (IMAP only, e.g., "INBOX", "Sent")
    /// </summary>
    public string FolderName { get; set; } = "INBOX";

    /// <summary>
    /// Maximum number of emails to retrieve per session
    /// </summary>
    public int MaxEmailsToRetrieve { get; set; } = 50;

    /// <summary>
    /// Directory path where attachments should be saved
    /// </summary>
    public string AttachmentSaveDirectory { get; set; } = "Attachments";

    /// <summary>
    /// Maximum attachment size in MB to download
    /// </summary>
    public int MaxAttachmentSizeMB { get; set; } = 10;

    /// <summary>
    /// Connection timeout in seconds
    /// </summary>
    public int TimeoutSeconds { get; set; } = 30;

    /// <summary>
    /// Validates the configuration settings
    /// </summary>
    public bool IsValid(out List<string> errors)
    {
        errors = new List<string>();

        if (string.IsNullOrWhiteSpace(Host))
            errors.Add("Host is required");

        if (Port <= 0 || Port > 65535)
            errors.Add("Port must be between 1 and 65535");

        if (string.IsNullOrWhiteSpace(Username))
            errors.Add("Username is required");

        if (string.IsNullOrWhiteSpace(Password))
            errors.Add("Password is required");

        if (MaxEmailsToRetrieve <= 0)
            errors.Add("MaxEmailsToRetrieve must be greater than 0");

        if (MaxAttachmentSizeMB <= 0)
            errors.Add("MaxAttachmentSizeMB must be greater than 0");

        if (TimeoutSeconds <= 0)
            errors.Add("TimeoutSeconds must be greater than 0");

        if (string.IsNullOrWhiteSpace(AttachmentSaveDirectory))
            errors.Add("AttachmentSaveDirectory is required");

        return errors.Count == 0;
    }
}

/// <summary>
/// Supported email protocols
/// </summary>
public enum EmailProtocol
{
    IMAP,
    POP3
}