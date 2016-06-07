package de.kanbanana.selenium.views;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class SearchView {

	public WebElement element = null;
	
	public  WebElement getSearchTextbox(WebDriver driver)
	{
		element = driver.findElement(By.id(""));
		return element;
	}
	
	public WebElement getSearchButton(WebDriver driver)
	{
		element = driver.findElement(By.id(""));
		return element;
	}
	
	public WebElement getNewArticleButton(WebDriver driver)
	{
		element = driver.findElement(By.xpath(".//*[@id='knowl-navbar']//button[text()='New article']"));
		return element;
	}
	
	public void SendKeysToSearchTextbox(WebDriver driver, String keys)
	{
		element = getSearchTextbox(driver);
		element.sendKeys(keys);
	}
	
	public void clickSearchButton(WebDriver driver)
	{
		element = getSearchButton(driver);
		element.click();
	}
	
	public void clickNewArticleButton(WebDriver driver)
	{
		element = getNewArticleButton(driver);
		element.click();
	}
	
	
}
