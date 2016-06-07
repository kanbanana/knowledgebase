package de.kanbanana.selenium.testcases;

import org.testng.annotations.Test;

import com.relevantcodes.extentreports.ExtentReports;
import com.relevantcodes.extentreports.ExtentTest;
import com.relevantcodes.extentreports.LogStatus;

import de.kanbanana.selenium.pages.NewArticlePage;
import de.kanbanana.selenium.pages.StartPage;
import de.kanbanana.selenium.utilities.*;

import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Parameters;

import java.awt.Toolkit;
import java.awt.datatransfer.Clipboard;
import java.awt.datatransfer.StringSelection;
import java.io.IOException;
import java.lang.reflect.Method;
import java.util.concurrent.TimeUnit;

import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.testng.Assert;
import org.testng.ITestResult;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.AfterSuite;

public class TestNG_CreateArticleTest {

	private WebDriver driver;
	private String baseUrl;
	private ExtentReports extentReport;
	private ExtentTest extentTest;
	private String directory = System.getProperty("user.dir") + "//test reports//";
	public TestNG_CreateArticleTest(WebDriver driver, String baseUrl, String browserName) {
		this.driver = driver;
		this.baseUrl = baseUrl;
		extentReport = new ExtentReports(directory + "report_"+browserName+".html");
	}



	@BeforeMethod
	public void beforeMethod(Method testMethod) {
		
	    Test nextTest = testMethod.getAnnotation(Test.class);
        if (nextTest  == null) {
            return;
        }
		
		String testName = nextTest.description();
		System.out.println(directory + testName);
		
		extentReport.addSystemInfo("Webbrowser", driver.toString());
		extentTest = extentReport.startTest(testName);
		driver.manage().window().maximize();
		driver.manage().timeouts().implicitlyWait(10, TimeUnit.SECONDS);
		driver.get(baseUrl);
	}

	@Test(description="[Save] KNOW-121 - Create article")
	public void CreateArcticle() {
		extentTest.log(LogStatus.INFO, "Start Test");
		StartPage.searchBar.clickNewArticleButton(driver);
		extentTest.log(LogStatus.INFO, "Click New article Button");
		NewArticlePage.articleEditor.sendKeysToArticleTitleTextbox(driver, "Hello World");
		extentTest.log(LogStatus.INFO, "Write artictle title");
		NewArticlePage.articleEditor.sendKeysToArticleTextbox(driver, "Hallo Welt!");
		extentTest.log(LogStatus.INFO, "Write artictle content");
		//driver.manage().timeouts().implicitlyWait(10, TimeUnit.SECONDS);
		NewArticlePage.articleEditor.clickArticleSaveButton(driver);
		String relativePath;
		String imagePath ="";
		try {
			relativePath = Screenshots.takeScreenshot(driver, "save");
			imagePath = extentTest.addScreenCapture(relativePath);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		extentTest.log(LogStatus.INFO, "click Save button");
		String parsedText =ScreenshotAnalyzer.parseText(imagePath);
		Assert.assertTrue(parsedText.contains("success!"));
		Assert.assertTrue(parsedText.contains("success!"));
		extentTest.log(LogStatus.INFO, "End Test");
	}
	
	@Test(description="[Save] KNOW-122 - Create article without title")
	public void CreateArcticleWithoutTitle() {
		extentTest.log(LogStatus.INFO, "Start Test");
		StartPage.searchBar.clickNewArticleButton(driver);
		extentTest.log(LogStatus.INFO, "Click New article Button");
		NewArticlePage.articleEditor.sendKeysToArticleTextbox(driver, "hallo");
		extentTest.log(LogStatus.INFO, "Write artictle content");
		NewArticlePage.articleEditor.clickArticleSaveButton(driver);
		extentTest.log(LogStatus.INFO, "click Save button");
		extentTest.log(LogStatus.INFO, "End Test");
	}
	
	@Test(description="[Save] KNOW-123 - Create article with invalid Email")
	public void CreateArcticleWithInvaildEmail() {
		extentTest.log(LogStatus.INFO, "Start Test");
		StartPage.searchBar.clickNewArticleButton(driver);
		extentTest.log(LogStatus.INFO, "Click New article Button");
		NewArticlePage.articleEditor.sendKeysToArticleTitleTextbox(driver, "Hallo Welt");
		extentTest.log(LogStatus.INFO, "Write artictle title");
		NewArticlePage.articleEditor.sendKeysToAuthorEmailTextbox(driver, "loremipsum");
		extentTest.log(LogStatus.INFO, "Write malformatted email");
		NewArticlePage.articleEditor.sendKeysToArticleTextbox(driver, "hallo");
		extentTest.log(LogStatus.INFO, "Write artictle content");
		NewArticlePage.articleEditor.clickArticleSaveButton(driver);
		extentTest.log(LogStatus.INFO, "click Save button");
		extentTest.log(LogStatus.INFO, "End Test");
	}
	
	@Test(description="[Alert] KNOW-133 - alert author")
	public void alertAuthor(){
		extentTest.log(LogStatus.INFO, "Start Test");
		
		extentTest.log(LogStatus.INFO, "End Test");
		
	}
	
	@Test(description="[Cancel] KNOW-134 - cancel article creation")
	public void cancelArticleCreation(){
		extentTest.log(LogStatus.INFO, "Start Test");
		
		extentTest.log(LogStatus.INFO, "End Test");
		
	}
	
	@Test(description="[Cancel] KNOW-135 - accedentily cancel article creation")
	public void accedentilyCancelArticleCreation(){
		extentTest.log(LogStatus.INFO, "Start Test");
		
		extentTest.log(LogStatus.INFO, "End Test");
		
	}
	
	@Test(description="[Upload] KNOW-138 - Uploading 1 MB File")
	public void upload1MBFile(){
		extentTest.log(LogStatus.INFO, "Start Test");
		
		extentTest.log(LogStatus.INFO, "End Test");
		
	}
	
	@Test(description="[Upload] KNOW-139 - Uploading 25 MB File")
	public void upload25MBFile(){
		extentTest.log(LogStatus.INFO, "Start Test");
		
		extentTest.log(LogStatus.INFO, "End Test");
		
	}
	
	@Test(description="[DeleteFile] KNOW-140 - delete file from article")
	public void deleteFileFromArticle(){
		extentTest.log(LogStatus.INFO, "Start Test");
		
		extentTest.log(LogStatus.INFO, "End Test");
		
	}
	
	@Test(description="[DeleteFile] KNOW-141 - delete accidently file and cancel editing")
	public void deleteFileAndCancelEditing(){
		extentTest.log(LogStatus.INFO, "Start Test");
		
		extentTest.log(LogStatus.INFO, "End Test");
		
	}

	

	@AfterMethod
	public void tearDown(ITestResult testResult) throws IOException {
		if (testResult.getStatus() == ITestResult.FAILURE) {
			String relativePath = Screenshots.takeScreenshot(driver, testResult.getName());
			String imagePath = extentTest.addScreenCapture(relativePath);
			extentTest.log(LogStatus.FAIL, testResult.getMethod().getDescription() + " failed", imagePath);

		}
		else
		{
			String relativePath = Screenshots.takeScreenshot(driver, testResult.getName());
			String imagePath = extentTest.addScreenCapture(relativePath);
			extentTest.log(LogStatus.PASS, testResult.getMethod().getDescription() + " passed", imagePath);
			
		}
		
		extentReport.endTest(extentTest);
		
	}

	@AfterSuite
	public void closeSuite() {
		driver.quit();
		extentReport.flush();
	}

}
