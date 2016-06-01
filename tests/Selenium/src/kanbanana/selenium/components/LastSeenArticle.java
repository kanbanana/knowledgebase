package kanbanana.selenium.components;

import java.util.ArrayList;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class LastSeenArticle {
	public WebElement element = null;
	
	public WebElement getArticleHeader(WebDriver driver)
	{
		element = driver.findElement(By.id(""));
		return element;
	}
	
	public WebElement getAuthor(WebDriver driver)
	{
		element = driver.findElement(By.id(""));
		return element;
	}
	
	public WebElement getLastChangedDate(WebDriver driver)
	{
		element = driver.findElement(By.id(""));
		return element;
	}
	
	public WebElement getChangedBy(WebDriver driver)
	{
		element = driver.findElement(By.id(""));
		return element;
	}
	
	public ArrayList<WebElement> getListOfAttachedDocuments(WebDriver driver)
	{
		ArrayList<WebElement> elements = null;
		//TODO Insert Logic
		return elements;
		
	}
	
	public void clickAuthor(WebDriver driver)
	{
		element = getAuthor(driver);
		element.click();
	}
	
	public void clickLastChangedDate(WebDriver driver)
	{
		element = getLastChangedDate(driver);
		element.click();
	}
	
	public void clickChangedBy(WebDriver driver)
	{
		element = getChangedBy(driver);
		element.click();
	}
	
	public void clickArticleHeader(WebDriver driver)
	{
		element = getArticleHeader(driver);
		element.click();
	}
}
