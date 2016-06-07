package de.kanbanana.selenium.utilities;

import java.io.File;
import java.io.IOException;

import org.apache.commons.io.FileUtils;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;

public class Screenshots {
	
	/**
	 * Saves a screenshot and places it to the project screenshot folder
	 * @param driver selenium Webdriver
	 * @param fileName name of the screenshort
	 * @return Returns the relative path of the screenshort related to the report folder.
	 * @throws IOException
	 */
	public static String takeScreenshot(WebDriver driver, String fileName) throws IOException {
		fileName = fileName + ".png";
		String directory = System.getProperty("user.dir")+"//screenshots//";
		File sourceFile = ((TakesScreenshot)driver).getScreenshotAs(OutputType.FILE);
		String destination = directory + fileName;
		String relativeDestination = "..//screenshots//" + fileName;
		FileUtils.copyFile(sourceFile, new File(destination));
		
		return relativeDestination;
		
	}
}
