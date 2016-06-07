package de.kanbanana.selenium.views;

import java.util.concurrent.TimeUnit;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;


public class CreateEditView {
	
	public WebElement element = null;
	
	public WebElement getArticleTitleTextbox(WebDriver driver)
	{
		element = driver.findElement(By.id("titelInput"));
		return element;
		
		
	}
	
	public WebElement getAuthorNameTextbox(WebDriver driver)
	{
		element = driver.findElement(By.id("changedbyInput"));
		return element;
	}
	
	public WebElement getAuthorEmailTextbox(WebDriver driver)
	{
		WebDriverWait wait = new WebDriverWait(driver, 30);
		WebElement element = wait.until(ExpectedConditions.elementToBeClickable(By.id("changedbyEmailInput_2")));
//		WebElement element= (new WebDriverWait(driver, 10))
//				  .until(ExpectedConditions.presenceOfElementLocated(By.id("changedbyEmailInput")));
		//element = driver.wait()findElement(By.id("changedbyEmailInput"));
		return element;
	}
	
	public WebElement getArticleSaveButton(WebDriver driver)
	{
		element = driver.findElement((By.id("saveButton_2")));
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
	
	public void sendKeysToArticleTextbox(WebDriver driver, String keys)
	{
		driver.manage().timeouts().implicitlyWait(20, TimeUnit.SECONDS);
		WebElement frame = driver.findElement(By.id("ui-tinymce-0_ifr"));
		driver.switchTo().frame(frame);
		driver.findElement(By.id("tinymce")).sendKeys(keys);;
		driver.switchTo().defaultContent();
		
		//Wait that the input is able to be published
		try {
			Thread.sleep(1000);
		} catch (InterruptedException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
	public void sendKeysToArticleTitleTextbox(WebDriver driver, String keys)
	{
		element = getArticleTitleTextbox(driver);
		element.sendKeys(keys);
	}
	
	public void sendKeysToAuthorNameTextbox(WebDriver driver, String keys)
	{
		element = getAuthorNameTextbox(driver);
		element.sendKeys(keys);
	}
	
	public void sendKeysToAuthorEmailTextbox(WebDriver driver, String keys)
	{
		element = getAuthorEmailTextbox(driver);
		element.sendKeys(keys);
		System.out.println(element.isSelected());

	
		
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
