# Professional Email Reader Application

A robust, production-ready C# console application for reading emails and processing attachments using IMAP and POP3 protocols. Built with modern .NET 8.0, featuring comprehensive error handling, logging, and clean architecture principles.

## 🚀 Features

### Core Email Operations
- **Multi-Protocol Support**: IMAP and POP3 protocols
- **Email Retrieval**: Read recent emails with customizable count and pagination
- **Advanced Search**: Search emails by subject, sender, content, date range, and more
- **Attachment Processing**: Download and save email attachments with size validation
- **Folder Management**: List and switch between folders (IMAP only)
- **Connection Management**: Test connections, persistent connections with auto-reconnection

### Advanced Features
- **Security**: Support for SSL/TLS encryption and app-specific passwords
- **Configuration**: JSON-based configuration with validation
- **Logging**: Comprehensive logging with configurable levels
- **Error Handling**: Robust error handling with detailed error messages
- **Performance**: Async/await patterns throughout for optimal performance
- **Memory Management**: Proper resource disposal and memory-efficient attachment handling

### Professional Architecture
- **Clean Architecture**: Separation of concerns with models, services, and interfaces
- **Dependency Injection**: Built-in DI container for loose coupling
- **SOLID Principles**: Following SOLID design principles
- **Extensibility**: Easy to extend with new features and email providers

## 📋 Prerequisites

- **.NET 8.0 SDK** or later
- **Email Account** with IMAP/POP3 access enabled
- **App-Specific Password** (recommended for Gmail, Yahoo, etc.)

## 🛠️ Installation

### 1. Clone or Download the Project
```bash
# If cloning from repository
git clone <repository-url>
cd email-reader-app/EmailReaderApp

# Or create the project structure as provided
```

### 2. Install Dependencies
```bash
dotnet restore
```

### 3. Configure Email Settings
Edit `appsettings.json` with your email configuration:

```json
{
  "EmailConfiguration": {
    "Host": "imap.gmail.com",
    "Port": 993,
    "Username": "your-email@gmail.com",
    "Password": "your-app-specific-password",
    "UseSsl": true,
    "Protocol": "IMAP",
    "FolderName": "INBOX",
    "MaxEmailsToRetrieve": 50,
    "AttachmentSaveDirectory": "Attachments",
    "MaxAttachmentSizeMB": 10,
    "TimeoutSeconds": 30
  }
}
```

### 4. Run the Application
```bash
dotnet run
```

## ⚙️ Configuration

### Email Provider Settings

#### Gmail
```json
{
  "Host": "imap.gmail.com",
  "Port": 993,
  "UseSsl": true,
  "Protocol": "IMAP"
}
```
**Setup Steps:**
1. Enable 2-Factor Authentication
2. Generate App Password: Google Account → Security → 2-Step Verification → App Passwords
3. Use the generated app password in the configuration

#### Outlook/Hotmail
```json
{
  "Host": "outlook.office365.com",
  "Port": 993,
  "UseSsl": true,
  "Protocol": "IMAP"
}
```

#### Yahoo Mail
```json
{
  "Host": "imap.mail.yahoo.com",
  "Port": 993,
  "UseSsl": true,
  "Protocol": "IMAP"
}
```
**Setup Steps:**
1. Go to Account Security in Yahoo
2. Generate App Password
3. Use the generated password

#### Apple iCloud
```json
{
  "Host": "imap.mail.me.com",
  "Port": 993,
  "UseSsl": true,
  "Protocol": "IMAP"
}
```

### Configuration Options

| Option | Description | Default | Required |
|--------|-------------|---------|----------|
| `Host` | Email server hostname | - | ✅ |
| `Port` | Server port number | - | ✅ |
| `Username` | Email address | - | ✅ |
| `Password` | Email password or app password | - | ✅ |
| `UseSsl` | Use SSL/TLS encryption | `true` | ✅ |
| `Protocol` | Email protocol (IMAP/POP3) | `IMAP` | ✅ |
| `FolderName` | Default folder to open | `INBOX` | ❌ |
| `MaxEmailsToRetrieve` | Maximum emails per operation | `50` | ❌ |
| `AttachmentSaveDirectory` | Attachment save location | `Attachments` | ❌ |
| `MaxAttachmentSizeMB` | Maximum attachment size | `10` | ❌ |
| `TimeoutSeconds` | Connection timeout | `30` | ❌ |

## 🎯 Usage Examples

### Basic Email Reading
```csharp
// The application provides an interactive menu with these options:
// 1. Retrieve Recent Emails - Get latest emails from your inbox
// 2. Search Emails - Search by various criteria
// 3. Download Attachments - Save email attachments to disk
// 4. List Folders - View available folders (IMAP only)
// 5. View Email Details - See detailed email information
// 6. Retrieve Emails Since Date - Get emails from a specific date
```

### Programmatic Usage
If you want to use the components programmatically:

```csharp
using EmailReaderApp.Models;
using EmailReaderApp.Services;
using Microsoft.Extensions.Logging;

// Setup configuration
var config = new EmailConfiguration
{
    Host = "imap.gmail.com",
    Port = 993,
    Username = "your-email@gmail.com",
    Password = "your-app-password",
    UseSsl = true,
    Protocol = EmailProtocol.IMAP
};

// Create logger (optional)
using var loggerFactory = LoggerFactory.Create(builder => builder.AddConsole());
var logger = loggerFactory.CreateLogger<EmailService>();

// Create and use email service
using var emailService = new EmailService(logger, config);

// Connect to server
await emailService.ConnectAsync();

// Get recent emails
var emails = await emailService.GetEmailsAsync(10);

// Search emails
var searchCriteria = new EmailSearchCriteria
{
    Subject = "Important",
    HasAttachments = true,
    SentAfter = DateTimeOffset.Now.AddDays(-7)
};
var searchResults = await emailService.SearchEmailsAsync(searchCriteria);

// Download attachments
foreach (var email in searchResults.Where(e => e.HasAttachments))
{
    await emailService.DownloadAllAttachmentsAsync(email, "Downloads");
}
```

## 🔧 Advanced Features

### Custom Search Criteria
```csharp
var criteria = new EmailSearchCriteria
{
    Subject = "Invoice",           // Search in subject
    From = "noreply@company.com",  // Search by sender
    Body = "payment due",          // Search in body
    SentAfter = DateTimeOffset.Now.AddDays(-30),  // Date range
    SentBefore = DateTimeOffset.Now,
    HasAttachments = true,         // Only emails with attachments
    IsRead = false,               // Only unread emails
    MaxResults = 100              // Limit results
};
```

### Folder Operations (IMAP)
```csharp
// List available folders
var folders = await emailService.GetFoldersAsync();

// Switch to a specific folder
await emailService.SelectFolderAsync("Sent");

// Get message counts
var totalCount = await emailService.GetMessageCountAsync();
var unreadCount = await emailService.GetUnreadCountAsync();
```

### Attachment Handling
```csharp
// Download specific attachment
foreach (var email in emails)
{
    foreach (var attachment in email.Attachments)
    {
        if (attachment.FileExtension == ".pdf")
        {
            await emailService.DownloadAttachmentAsync(attachment, "PDFs");
        }
    }
}
```

## 🛡️ Security Considerations

### App-Specific Passwords
- **Gmail**: Use app-specific passwords instead of your main password
- **Yahoo**: Generate app passwords from Account Security settings
- **Outlook**: May require app passwords for some configurations

### SSL/TLS Encryption
- Always use `UseSsl: true` for production environments
- The application defaults to secure connections

### Configuration Security
- Store sensitive configuration in `appsettings.local.json` (not in source control)
- Use environment variables for production deployments
- Consider using Azure Key Vault or similar services for production

## 📊 Logging

The application includes comprehensive logging:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "EmailReaderApp": "Debug"
    }
  }
}
```

### Log Levels
- **Debug**: Detailed debugging information
- **Information**: General operational messages
- **Warning**: Warning conditions
- **Error**: Error conditions
- **Critical**: Critical errors

## 🔍 Troubleshooting

### Common Issues

#### Connection Refused
- **Cause**: Incorrect host/port or firewall issues
- **Solution**: Verify server settings and check firewall/proxy settings

#### Authentication Failed
- **Cause**: Incorrect credentials or 2FA required
- **Solution**: 
  - Verify username/password
  - Generate app-specific password for 2FA-enabled accounts
  - Check if IMAP/POP3 is enabled in email settings

#### SSL/TLS Errors
- **Cause**: Certificate validation issues
- **Solution**: Ensure `UseSsl: true` and correct port numbers

#### Attachment Download Fails
- **Cause**: Size limits or permission issues
- **Solution**: 
  - Check `MaxAttachmentSizeMB` setting
  - Verify write permissions to attachment directory
  - Ensure sufficient disk space

### Debug Tips
1. Enable debug logging: Set `"EmailReaderApp": "Debug"` in appsettings.json
2. Test connection first using the built-in connection test
3. Start with a small number of emails for testing
4. Check email provider documentation for specific requirements

## 🏗️ Architecture

### Project Structure
```
EmailReaderApp/
├── Models/
│   ├── EmailConfiguration.cs    # Configuration model
│   └── EmailMessage.cs          # Email data models
├── Services/
│   ├── IEmailService.cs         # Service interface
│   └── EmailService.cs          # Service implementation
├── Program.cs                   # Main application entry point
├── appsettings.json            # Configuration file
└── README.md                   # This file
```

### Key Components

#### EmailService
- Core service implementing `IEmailService` interface
- Handles IMAP/POP3 protocol operations
- Manages connections and error handling

#### EmailConfiguration
- Strongly-typed configuration model
- Built-in validation
- Support for multiple email providers

#### EmailMessage & EmailAttachment
- Rich data models for email content
- Attachment metadata and content handling
- Human-readable formatting methods

## 🚀 Performance Considerations

### Memory Management
- Attachments are loaded into memory during processing
- Large attachments are handled efficiently with streaming
- Proper disposal of resources using `using` statements

### Connection Management
- Persistent connections for multiple operations
- Connection pooling for high-volume scenarios
- Automatic reconnection on connection loss

### Batch Operations
- Configurable batch sizes for email retrieval
- Pagination support for large mailboxes
- Rate limiting to respect server constraints

## 🤝 Contributing

To extend or modify the application:

1. **Adding New Email Providers**: Update configuration examples and add provider-specific settings
2. **New Features**: Implement new methods in `IEmailService` and `EmailService`
3. **UI Improvements**: Enhance the console interface in `Program.cs`
4. **Performance**: Optimize email processing and attachment handling

## 📝 License

This is a demonstration application. Please review and comply with your email provider's terms of service and any applicable licenses.

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review email provider documentation
3. Enable debug logging for detailed error information
4. Verify configuration settings

---

**Built with 💻 using .NET 8.0, MailKit, and modern C# practices**