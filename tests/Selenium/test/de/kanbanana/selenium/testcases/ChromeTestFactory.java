package de.kanbanana.selenium.testcases;

import org.openqa.selenium.chrome.ChromeDriver;
import org.testng.annotations.Factory;
import org.testng.annotations.Parameters;

public class ChromeTestFactory {
	 @Factory
	 @Parameters({"baseUrl", "browserName"})
	  public Object[] createTests(String baseUrl, String browserName) {
		System.out.println(System.getProperty("user.dir")+"\\chromedriver.exe");
		System.setProperty("webdriver.chrome.driver", System.getProperty("user.dir")+"//chromedriver.exe");
	    return new Object[] {
	      new TestNG_CreateArticleTest(new ChromeDriver(),baseUrl, browserName)
	    };
	  }
}
