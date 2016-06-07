package de.kanbanana.selenium.utilities;

import java.io.File;

import net.sourceforge.tess4j.ITesseract;
import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;

public class ScreenshotAnalyzer {

	public static String parseText(String pathToImage){
		   File imageFile = new File(pathToImage);
		    ITesseract instance = new Tesseract();  // JNA Interface Mapping
		    instance.setDatapath(System.getProperty("user.dir")+"//configs//Tess4J");
		    // ITesseract instance = new Tesseract1(); // JNA Direct Mapping
		    String result= "";
		    try {
		        result = instance.doOCR(imageFile);
		        return result;
		    } catch (TesseractException e) {
		        System.err.println(e.getMessage());
		        result= e.getMessage();
		    }
			return result;
		    
	}
 
}
