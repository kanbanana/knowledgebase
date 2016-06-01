package kanbanana.selenium;

import org.testng.annotations.Test;

import kanbanana.selenium.components.ArticleEditor;
import kanbanana.selenium.page.classes.NewArticlePage;

import org.testng.annotations.BeforeMethod;

import java.util.concurrent.TimeUnit;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.testng.annotations.AfterMethod;

public class TestNG_TestSuite {
	
  private WebDriver driver;
  private String baseUrl;
 
	
 
  
  @BeforeMethod
  public void beforeMethod() {
	  driver = new FirefoxDriver();
	  baseUrl = "";
	  
	  driver.manage().window().maximize();
	  driver.manage().timeouts().implicitlyWait(10, TimeUnit.SECONDS);
	  
  }
  
  @Test
  public void CreateArcticle() {
	  NewArticlePage.articleEditor.sendKeysToArticleTitleTextbox(driver, "Hello World");
	  NewArticlePage.articleEditor.sendKeysToAuthorNameTextbox(driver, "Max");
	  NewArticlePage.articleEditor.sendKeysToAuthorEmailTextbox(driver,"Max@test.de");
	  NewArticlePage.articleEditor.sendKeysToArticleTextbox(driver, "Hallo Welt!");
	  NewArticlePage.articleEditor.clickArticleSaveButton(driver);
  }

  @AfterMethod
  public void afterMethod() {
  }

}
