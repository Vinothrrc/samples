// <Snippet1>
#region Using directives

using System;
using System.Collections.Generic;
using System.Text;
using System.Configuration;
using System.Web;
using System.Web.Configuration;

#endregion

namespace Samples.Aspnet.SystemWebConfiguration
{
  class UsingSecurityPolicySection
  {
    static void Main(string[] args)
    {
      try
      {
        // Set the path of the config file.
        string configPath = "";

        // Get the Web application configuration object.
        Configuration config = 
          WebConfigurationManager.OpenWebConfiguration(configPath);

        // Get the section-related object.
        SecurityPolicySection configSection =
          (SecurityPolicySection)config.GetSection("system.web/securityPolicy");

        // Display title and info.
        Console.WriteLine("ASP.NET Configuration Info");
        Console.WriteLine();

        // Display Config details.
        Console.WriteLine("File Path: {0}",
          config.FilePath);
        Console.WriteLine("Section Path: {0}",
          configSection.SectionInformation.Name);

        // Display the number of trust levels.
        Console.WriteLine("TrustLevels Collection Count: {0}",
          configSection.TrustLevels.Count);

// <Snippet2>
        // Display elements of the TrustLevels collection property.
        for (int i = 0; i < configSection.TrustLevels.Count; i++) 
        {
          Console.WriteLine();
          Console.WriteLine("TrustLevel {0}:", i);
          Console.WriteLine("Name: {0}", 
            configSection.TrustLevels.Get(i).Name);
          Console.WriteLine("Type: {0}", 
            configSection.TrustLevels.Get(i).PolicyFile);
        }

        // Add a TrustLevel element to the configuration file.
        configSection.TrustLevels.Add(new TrustLevel("myTrust", "mytrust.config"));
// </Snippet2>

        // Update if not locked.
        if (!configSection.SectionInformation.IsLocked)
        {
          config.Save();
          Console.WriteLine("** Configuration updated.");
        }
        else
        {
          Console.WriteLine("** Could not update; section is locked.");
        }
      }

      catch (Exception e)
      {
        // Unknown error.
        Console.WriteLine(e.ToString());
      }

      // Display and wait
      Console.ReadLine();
    }
  }
}
// </Snippet1>