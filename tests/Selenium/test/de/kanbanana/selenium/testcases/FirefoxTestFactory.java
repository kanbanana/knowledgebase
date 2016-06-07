package de.kanbanana.selenium.testcases;

import org.openqa.selenium.firefox.FirefoxDriver;
import org.testng.annotations.Factory;
import org.testng.annotations.Parameters;

public class FirefoxTestFactory {


	 @Factory
	 @Parameters({"baseUrl", "browserName"})
	  public Object[] createTests(String baseUrl, String browserName) {
		return new Object[] {
	      new TestNG_CreateArticleTest(new FirefoxDriver(),baseUrl, browserName)
	    };
	  }
}
