package kanbanana.selenium;

import org.testng.annotations.Test;

import com.relevantcodes.extentreports.ExtentReports;
import com.relevantcodes.extentreports.ExtentTest;
import com.relevantcodes.extentreports.LogStatus;

import kanbanana.selenium.page.classes.NewArticlePage;
import utilities.Screenshots;

import org.testng.annotations.BeforeMethod;

import java.io.IOException;
import java.lang.reflect.Method;
import java.util.concurrent.TimeUnit;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.testng.ITestContext;
import org.testng.ITestResult;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.AfterSuite;

public class TestNG_TestSuite {
	
  private WebDriver driver;
  private String baseUrl;
  ExtentReports report;
  ExtentTest test;
  String directory = System.getProperty("user.dir")+"//test reports//";	
 
  
  @BeforeMethod
  public void beforeMethod(Method testMethod) {
	  driver = new FirefoxDriver();
	  baseUrl = "http://www.google.de";
	  String testName = testMethod.getName()+".html";
	  System.out.println(directory+testName);
	  report = new ExtentReports(directory+testName);
	  test = report.startTest(testName);
	  driver.manage().window().maximize();
	  driver.manage().timeouts().implicitlyWait(10, TimeUnit.SECONDS);
	  driver.get(baseUrl);
  }
  
  @Test
  public void CreateArcticle() {
	  test.log(LogStatus.INFO, "Start Test");
	  NewArticlePage.articleEditor.sendKeysToArticleTitleTextbox(driver, "Hello World");
	  test.log(LogStatus.INFO, "Write artictle title");
	  NewArticlePage.articleEditor.sendKeysToAuthorNameTextbox(driver, "Max");
	  test.log(LogStatus.INFO, "Write author name");
	  NewArticlePage.articleEditor.sendKeysToAuthorEmailTextbox(driver,"Max@test.de");
	  test.log(LogStatus.INFO, "Write author email");
	  NewArticlePage.articleEditor.sendKeysToArticleTextbox(driver, "Hallo Welt!");
	  test.log(LogStatus.INFO, "Write artictle content");
	  NewArticlePage.articleEditor.uploadFile("path/to/File");
	  test.log(LogStatus.INFO, "Upload file");
	  NewArticlePage.articleEditor.clickArticleSaveButton(driver);
	  test.log(LogStatus.INFO, "click Save button");
	  test.log(LogStatus.INFO, "End Test");
  }

  @AfterMethod
	public void tearDown(ITestResult testResult) throws IOException {
		if (testResult.getStatus() == ITestResult.FAILURE) {
			String relativePath = Screenshots.takeScreenshot(driver, testResult.getName());
			String imagePath = test.addScreenCapture(relativePath);
			test.log(LogStatus.FAIL, testResult.getTestName()+ " failed", imagePath);
			report.endTest(test);
			report.flush();
		}
	}
  
    @AfterSuite
  	public void closeSuite(){
    	driver.quit();
  	}

}
