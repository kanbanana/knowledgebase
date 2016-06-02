package kanbanana.selenium.components;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class ArticleEditor {
	
	public WebElement element = null;
	
	public WebElement getArticleTitleTextbox(WebDriver driver)
	{
		element = driver.findElement(By.id(""));
		return element;
		
		
	}
	
	public WebElement getAuthorNameTextbox(WebDriver driver)
	{
		element = driver.findElement(By.id(""));
		return element;
	}
	
	public WebElement getAuthorEmailTextbox(WebDriver driver)
	{
		element = driver.findElement(By.id(""));
		return element;
	}
	
	public WebElement getArticleSaveButton(WebDriver driver)
	{
		element = driver.findElement(By.id(""));
		return element;
	}
	
	public WebElement getArticleCancelButton(WebDriver driver)
	{
		element = driver.findElement(By.id(""));
		return element;
	}
	
	public WebElement getUnsavedLeaveButton(WebDriver driver)
	{
		element = driver.findElement(By.id(""));
		return element;
	}
	
	public WebElement getUnsavedStayButton(WebDriver driver)
	{
		element = driver.findElement(By.id(""));
		return element;
	}
	
	public WebElement getArticleTextbox(WebDriver driver)
	{
		element = driver.findElement(By.id(""));
		return element;
	}
	
	public void sendKeysToArticleTitleTextbox(WebDriver driver, String Keys)
	{
		element = getArticleTitleTextbox(driver);
		element.sendKeys(Keys);
	}
	
	public void sendKeysToAuthorNameTextbox(WebDriver driver, String Keys)
	{
		element = getAuthorNameTextbox(driver);
		element.sendKeys(Keys);
	}
	
	public void sendKeysToAuthorEmailTextbox(WebDriver driver, String Keys)
	{
		element = getAuthorEmailTextbox(driver);
		element.sendKeys(Keys);
	}
	
	public void sendKeysToArticleTextbox(WebDriver driver, String Keys)
	{
		element = getArticleTextbox(driver);
		element.sendKeys(Keys);
	}
	
	public void clickArticleSaveButton(WebDriver driver)
	{
		element = getArticleSaveButton(driver);
		element.click();
	}
	
	public void clickArticleCancelButton(WebDriver driver)
	{
		element = getArticleCancelButton(driver);
		element.click();
	}
	
	public void clickUnsavedLeaveButton(WebDriver driver)
	{
		element = getUnsavedLeaveButton(driver);
		element.click();
	}
	
	public void clickUnsavedStayButton(WebDriver driver)
	{
		element = getUnsavedStayButton(driver);
		element.click();
	}
	
	public void uploadFile(String pathToFile)
	{
		//Logic 
	}

}
