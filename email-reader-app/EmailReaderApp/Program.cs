using EmailReaderApp.Models;
using EmailReaderApp.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System.Text;

namespace EmailReaderApp;

/// <summary>
/// Professional Email Reader Console Application
/// Demonstrates reading emails and attachments using IMAP/POP3 protocols
/// </summary>
public class Program
{
    private static IServiceProvider? _serviceProvider;
    private static ILogger<Program>? _logger;
    private static EmailConfiguration? _emailConfig;

    public static async Task Main(string[] args)
    {
        Console.OutputEncoding = Encoding.UTF8;
        Console.WriteLine("=== Professional Email Reader Application ===");
        Console.WriteLine("A robust C# application for reading emails and processing attachments\n");

        try
        {
            // Setup configuration and services
            SetupServices();
            
            _logger = _serviceProvider!.GetRequiredService<ILogger<Program>>();
            _logger.LogInformation("Email Reader Application started");

            // Load and validate configuration
            if (!LoadConfiguration())
            {
                Console.WriteLine("Press any key to exit...");
                Console.ReadKey();
                return;
            }

            // Create email service and run demonstration
            using var emailService = _serviceProvider!.GetRequiredService<IEmailService>();
            
            await RunEmailReaderDemo(emailService);
        }
        catch (Exception ex)
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine($"Fatal error: {ex.Message}");
            Console.ResetColor();
            _logger?.LogError(ex, "Fatal error occurred");
        }
        finally
        {
            (_serviceProvider as IDisposable)?.Dispose();
            Console.WriteLine("\nPress any key to exit...");
            Console.ReadKey();
        }
    }

    private static void SetupServices()
    {
        // Build configuration
        var configuration = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
            .AddJsonFile("appsettings.local.json", optional: true, reloadOnChange: true)
            .AddEnvironmentVariables()
            .Build();

        // Setup dependency injection
        var services = new ServiceCollection();
        
        // Add logging
        services.AddLogging(builder =>
        {
            builder.ClearProviders()
                   .AddConfiguration(configuration.GetSection("Logging"))
                   .AddConsole();
        });

        // Register configuration
        services.AddSingleton<IConfiguration>(configuration);
        
        // Register email configuration
        var emailConfig = new EmailConfiguration();
        configuration.GetSection("EmailConfiguration").Bind(emailConfig);
        services.AddSingleton(emailConfig);

        // Register email service
        services.AddTransient<IEmailService, EmailService>();

        _serviceProvider = services.BuildServiceProvider();
    }

    private static bool LoadConfiguration()
    {
        try
        {
            _emailConfig = _serviceProvider!.GetRequiredService<EmailConfiguration>();
            
            // Validate configuration
            if (!_emailConfig.IsValid(out var errors))
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine("❌ Email configuration is invalid:");
                foreach (var error in errors)
                {
                    Console.WriteLine($"   • {error}");
                }
                Console.ResetColor();
                
                Console.WriteLine("\n📋 Please update appsettings.json with your email configuration:");
                Console.WriteLine("   • Host: Your email server (e.g., imap.gmail.com)");
                Console.WriteLine("   • Port: Server port (e.g., 993 for IMAP SSL)");
                Console.WriteLine("   • Username: Your email address");
                Console.WriteLine("   • Password: Your email password or app-specific password");
                Console.WriteLine("   • Protocol: IMAP or POP3");
                Console.WriteLine("\n🔒 Security Note: Use app-specific passwords for Gmail, Yahoo, and other providers that support 2FA");
                
                return false;
            }

            Console.WriteLine("✅ Configuration loaded successfully");
            Console.WriteLine($"📧 Server: {_emailConfig.Host}:{_emailConfig.Port} ({_emailConfig.Protocol})");
            Console.WriteLine($"👤 User: {_emailConfig.Username}");
            Console.WriteLine($"📁 Folder: {_emailConfig.FolderName}");
            Console.WriteLine();

            return true;
        }
        catch (Exception ex)
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine($"❌ Failed to load configuration: {ex.Message}");
            Console.ResetColor();
            return false;
        }
    }

    private static async Task RunEmailReaderDemo(IEmailService emailService)
    {
        Console.WriteLine("🔄 Testing connection to email server...");
        
        // Test connection first
        if (!await emailService.TestConnectionAsync())
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine("❌ Failed to connect to email server. Please check your configuration and network connection.");
            Console.ResetColor();
            return;
        }

        Console.WriteLine("✅ Connection test successful!");
        Console.WriteLine();

        // Connect to email server
        Console.WriteLine("🔗 Connecting to email server...");
        if (!await emailService.ConnectAsync())
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine("❌ Failed to establish persistent connection to email server.");
            Console.ResetColor();
            return;
        }

        Console.WriteLine("✅ Connected successfully!");
        Console.WriteLine();

        try
        {
            // Display server information
            await DisplayServerInfo(emailService);

            // Main menu loop
            while (true)
            {
                DisplayMainMenu();
                var choice = Console.ReadLine()?.Trim();

                switch (choice?.ToLower())
                {
                    case "1":
                        await RetrieveRecentEmails(emailService);
                        break;
                    case "2":
                        await SearchEmails(emailService);
                        break;
                    case "3":
                        await DownloadAttachments(emailService);
                        break;
                    case "4":
                        await DisplayFolders(emailService);
                        break;
                    case "5":
                        await DisplayEmailDetails(emailService);
                        break;
                    case "6":
                        await RetrieveEmailsSince(emailService);
                        break;
                    case "0":
                    case "q":
                    case "quit":
                    case "exit":
                        Console.WriteLine("👋 Goodbye!");
                        return;
                    default:
                        Console.WriteLine("❌ Invalid option. Please try again.");
                        break;
                }

                Console.WriteLine("\nPress any key to continue...");
                Console.ReadKey();
                Console.Clear();
            }
        }
        catch (Exception ex)
        {
            _logger?.LogError(ex, "Error in email reader demo");
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine($"❌ An error occurred: {ex.Message}");
            Console.ResetColor();
        }
        finally
        {
            Console.WriteLine("🔌 Disconnecting from email server...");
            await emailService.DisconnectAsync();
        }
    }

    private static async Task DisplayServerInfo(IEmailService emailService)
    {
        Console.WriteLine("📊 Server Information:");
        
        var messageCount = await emailService.GetMessageCountAsync();
        Console.WriteLine($"   📧 Total Messages: {messageCount:N0}");

        if (_emailConfig?.Protocol == EmailProtocol.IMAP)
        {
            var unreadCount = await emailService.GetUnreadCountAsync();
            Console.WriteLine($"   📬 Unread Messages: {unreadCount:N0}");
        }
        
        Console.WriteLine();
    }

    private static void DisplayMainMenu()
    {
        Console.WriteLine("╔════════════════════════════════════════╗");
        Console.WriteLine("║            EMAIL READER MENU          ║");
        Console.WriteLine("╠════════════════════════════════════════╣");
        Console.WriteLine("║ 1. Retrieve Recent Emails             ║");
        Console.WriteLine("║ 2. Search Emails                      ║");
        Console.WriteLine("║ 3. Download Attachments                ║");
        Console.WriteLine("║ 4. List Folders (IMAP only)           ║");
        Console.WriteLine("║ 5. View Email Details                 ║");
        Console.WriteLine("║ 6. Retrieve Emails Since Date         ║");
        Console.WriteLine("║ 0. Exit                                ║");
        Console.WriteLine("╚════════════════════════════════════════╝");
        Console.Write("Choose an option: ");
    }

    private static async Task RetrieveRecentEmails(IEmailService emailService)
    {
        Console.WriteLine("\n📧 Retrieving Recent Emails...");
        
        Console.Write("Enter number of emails to retrieve (default 10): ");
        var countInput = Console.ReadLine();
        var count = int.TryParse(countInput, out var c) ? c : 10;

        var emails = await emailService.GetEmailsAsync(count);
        
        if (emails.Count == 0)
        {
            Console.WriteLine("📭 No emails found.");
            return;
        }

        Console.WriteLine($"\n📬 Found {emails.Count} emails:\n");
        DisplayEmailList(emails);
    }

    private static async Task SearchEmails(IEmailService emailService)
    {
        Console.WriteLine("\n🔍 Search Emails");
        
        var criteria = new EmailSearchCriteria();
        
        Console.Write("Search in subject (leave empty to skip): ");
        criteria.Subject = Console.ReadLine();
        
        Console.Write("Search by sender (leave empty to skip): ");
        criteria.From = Console.ReadLine();
        
        Console.Write("Search emails with attachments? (y/n, leave empty to skip): ");
        var attachmentInput = Console.ReadLine()?.ToLower();
        if (attachmentInput == "y") criteria.HasAttachments = true;
        else if (attachmentInput == "n") criteria.HasAttachments = false;

        Console.Write("Maximum results (default 20): ");
        var maxInput = Console.ReadLine();
        criteria.MaxResults = int.TryParse(maxInput, out var max) ? max : 20;

        Console.WriteLine("\n🔍 Searching...");
        var emails = await emailService.SearchEmailsAsync(criteria);
        
        if (emails.Count == 0)
        {
            Console.WriteLine("📭 No emails found matching your criteria.");
            return;
        }

        Console.WriteLine($"\n📬 Found {emails.Count} matching emails:\n");
        DisplayEmailList(emails);
    }

    private static async Task DownloadAttachments(IEmailService emailService)
    {
        Console.WriteLine("\n📎 Download Attachments");
        
        Console.Write("Enter number of recent emails to check for attachments (default 10): ");
        var countInput = Console.ReadLine();
        var count = int.TryParse(countInput, out var c) ? c : 10;

        var emails = await emailService.GetEmailsAsync(count);
        var emailsWithAttachments = emails.Where(e => e.HasAttachments).ToList();
        
        if (emailsWithAttachments.Count == 0)
        {
            Console.WriteLine("📭 No emails with attachments found.");
            return;
        }

        Console.WriteLine($"\n📎 Found {emailsWithAttachments.Count} emails with attachments:\n");
        
        for (int i = 0; i < emailsWithAttachments.Count; i++)
        {
            var email = emailsWithAttachments[i];
            Console.WriteLine($"{i + 1}. {email.Subject} - {email.AttachmentCount} attachment(s)");
            Console.WriteLine($"   From: {email.From.FullAddress}");
            Console.WriteLine($"   Date: {email.DateSent:yyyy-MM-dd HH:mm}");
            Console.WriteLine();
        }

        Console.Write("Enter email number to download attachments (0 to cancel): ");
        var emailChoice = Console.ReadLine();
        
        if (!int.TryParse(emailChoice, out var emailIndex) || emailIndex < 1 || emailIndex > emailsWithAttachments.Count)
        {
            Console.WriteLine("❌ Invalid selection.");
            return;
        }

        var selectedEmail = emailsWithAttachments[emailIndex - 1];
        
        Console.WriteLine($"\n📎 Downloading {selectedEmail.AttachmentCount} attachments...");
        
        var saveDirectory = Path.Combine(Directory.GetCurrentDirectory(), _emailConfig!.AttachmentSaveDirectory);
        var successCount = await emailService.DownloadAllAttachmentsAsync(selectedEmail, saveDirectory);
        
        Console.WriteLine($"✅ Successfully downloaded {successCount}/{selectedEmail.AttachmentCount} attachments to: {saveDirectory}");
        
        foreach (var attachment in selectedEmail.Attachments)
        {
            if (attachment.IsDownloaded)
            {
                Console.WriteLine($"   ✅ {attachment.FileName} ({attachment.FormattedSize})");
            }
            else
            {
                Console.WriteLine($"   ❌ {attachment.FileName} - {attachment.DownloadError}");
            }
        }
    }

    private static async Task DisplayFolders(IEmailService emailService)
    {
        if (_emailConfig?.Protocol != EmailProtocol.IMAP)
        {
            Console.WriteLine("📁 Folder listing is only available for IMAP connections.");
            return;
        }

        Console.WriteLine("\n📁 Available Folders:");
        
        var folders = await emailService.GetFoldersAsync();
        
        if (folders.Count == 0)
        {
            Console.WriteLine("📭 No folders found.");
            return;
        }

        for (int i = 0; i < folders.Count; i++)
        {
            Console.WriteLine($"{i + 1}. {folders[i]}");
        }

        Console.Write("\nEnter folder number to switch to (0 to cancel): ");
        var choice = Console.ReadLine();
        
        if (int.TryParse(choice, out var folderIndex) && folderIndex > 0 && folderIndex <= folders.Count)
        {
            var selectedFolder = folders[folderIndex - 1];
            Console.WriteLine($"\n🔄 Switching to folder: {selectedFolder}");
            
            if (await emailService.SelectFolderAsync(selectedFolder))
            {
                Console.WriteLine("✅ Folder changed successfully!");
                await DisplayServerInfo(emailService);
            }
            else
            {
                Console.WriteLine("❌ Failed to change folder.");
            }
        }
    }

    private static async Task DisplayEmailDetails(IEmailService emailService)
    {
        Console.WriteLine("\n📧 View Email Details");
        
        Console.Write("Enter number of recent emails to list (default 5): ");
        var countInput = Console.ReadLine();
        var count = int.TryParse(countInput, out var c) ? c : 5;

        var emails = await emailService.GetEmailsAsync(count);
        
        if (emails.Count == 0)
        {
            Console.WriteLine("📭 No emails found.");
            return;
        }

        Console.WriteLine($"\n📬 Recent emails:\n");
        for (int i = 0; i < emails.Count; i++)
        {
            Console.WriteLine($"{i + 1}. {emails[i].Subject}");
            Console.WriteLine($"   From: {emails[i].From.FullAddress}");
            Console.WriteLine($"   Date: {emails[i].DateSent:yyyy-MM-dd HH:mm}");
        }

        Console.Write("\nEnter email number to view details (0 to cancel): ");
        var choice = Console.ReadLine();
        
        if (int.TryParse(choice, out var emailIndex) && emailIndex > 0 && emailIndex <= emails.Count)
        {
            var email = emails[emailIndex - 1];
            DisplayDetailedEmail(email);
        }
    }

    private static async Task RetrieveEmailsSince(IEmailService emailService)
    {
        Console.WriteLine("\n📅 Retrieve Emails Since Date");
        
        Console.Write("Enter date (yyyy-MM-dd) or days ago (e.g., '7' for 7 days ago): ");
        var dateInput = Console.ReadLine()?.Trim();
        
        DateTimeOffset sinceDate;
        
        if (int.TryParse(dateInput, out var daysAgo))
        {
            sinceDate = DateTimeOffset.Now.AddDays(-daysAgo);
        }
        else if (DateTimeOffset.TryParse(dateInput, out sinceDate))
        {
            // Date parsed successfully
        }
        else
        {
            Console.WriteLine("❌ Invalid date format.");
            return;
        }

        Console.WriteLine($"\n🔍 Retrieving emails since {sinceDate:yyyy-MM-dd HH:mm}...");
        
        var emails = await emailService.GetEmailsSinceAsync(sinceDate);
        
        if (emails.Count == 0)
        {
            Console.WriteLine("📭 No emails found since the specified date.");
            return;
        }

        Console.WriteLine($"\n📬 Found {emails.Count} emails:\n");
        DisplayEmailList(emails);
    }

    private static void DisplayEmailList(List<EmailMessage> emails)
    {
        for (int i = 0; i < emails.Count; i++)
        {
            var email = emails[i];
            var attachmentIndicator = email.HasAttachments ? "📎" : "  ";
            var sizeInfo = FormatSize(email.SizeInBytes);
            
            Console.WriteLine($"{i + 1:D2}. {attachmentIndicator} {email.Subject}");
            Console.WriteLine($"     From: {email.From.FullAddress}");
            Console.WriteLine($"     Date: {email.DateSent:yyyy-MM-dd HH:mm} | Size: {sizeInfo}");
            
            if (email.HasAttachments)
            {
                Console.WriteLine($"     Attachments: {email.AttachmentCount} ({FormatSize(email.TotalAttachmentSize)})");
            }
            
            Console.WriteLine();
        }
    }

    private static void DisplayDetailedEmail(EmailMessage email)
    {
        Console.WriteLine($"\n╔══════════════════════════════════════════════════════════════╗");
        Console.WriteLine($"║                        EMAIL DETAILS                        ║");
        Console.WriteLine($"╚══════════════════════════════════════════════════════════════╝");
        
        Console.WriteLine($"📧 Subject: {email.Subject}");
        Console.WriteLine($"👤 From: {email.From.FullAddress}");
        
        if (email.To.Any())
        {
            Console.WriteLine($"📨 To: {string.Join(", ", email.To.Select(t => t.FullAddress))}");
        }
        
        if (email.Cc.Any())
        {
            Console.WriteLine($"📄 CC: {string.Join(", ", email.Cc.Select(c => c.FullAddress))}");
        }
        
        Console.WriteLine($"📅 Date Sent: {email.DateSent:yyyy-MM-dd HH:mm:ss}");
        Console.WriteLine($"📊 Size: {FormatSize(email.SizeInBytes)}");
        Console.WriteLine($"⭐ Priority: {email.Priority}");
        
        if (email.HasAttachments)
        {
            Console.WriteLine($"\n📎 Attachments ({email.AttachmentCount}):");
            foreach (var attachment in email.Attachments)
            {
                var inlineIndicator = attachment.IsInline ? " (inline)" : "";
                Console.WriteLine($"   • {attachment.FileName} ({attachment.FormattedSize}){inlineIndicator}");
                Console.WriteLine($"     Type: {attachment.ContentType}");
            }
        }
        
        Console.WriteLine("\n📝 Email Body:");
        if (!string.IsNullOrEmpty(email.BodyText))
        {
            var bodyPreview = email.BodyText.Length > 500 
                ? email.BodyText.Substring(0, 500) + "..."
                : email.BodyText;
            Console.WriteLine($"   {bodyPreview}");
        }
        else if (!string.IsNullOrEmpty(email.BodyHtml))
        {
            Console.WriteLine("   [HTML content - text preview not available]");
        }
        else
        {
            Console.WriteLine("   [No body content]");
        }
    }

    private static string FormatSize(long bytes)
    {
        if (bytes < 1024) return $"{bytes} B";
        if (bytes < 1024 * 1024) return $"{bytes / 1024.0:F1} KB";
        if (bytes < 1024 * 1024 * 1024) return $"{bytes / (1024.0 * 1024.0):F1} MB";
        return $"{bytes / (1024.0 * 1024.0 * 1024.0):F1} GB";
    }
}
