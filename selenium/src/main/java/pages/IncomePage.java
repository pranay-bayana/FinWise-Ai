package pages;

import base.BasePage;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.Select;

public class IncomePage extends BasePage {

    private final By addIncomeButton = By.xpath("//main//button[contains(., 'Add Income')]");
    private final By amountInput = By.cssSelector("form input[type='number']");
    private final By categorySelect = By.cssSelector("form select");
    private final By descriptionInput = By.cssSelector("form input[placeholder='Source of income']");
    private final By notesTextarea = By.cssSelector("form textarea");
    private final By submitButton = By.cssSelector("form button[type='submit']");
    private final By searchBox = By.cssSelector("input[placeholder='Search income...']");
    private final By toastSuccess = By.xpath("//*[@role='status' and contains(., 'successfully')]");

    public IncomePage(WebDriver driver) {
        super(driver);
    }

    public void navigateTo(String baseUrl) {
        driver.get(baseUrl + "/income");
    }

    public void addIncome(String amount, String category, String description, String notes) {
        click(addIncomeButton);
        type(amountInput, amount);
        
        selectOptionContainingText(categorySelect, category);

        type(descriptionInput, description);
        if (notes != null && !notes.isEmpty()) {
            type(notesTextarea, notes);
        }
        click(submitButton);
        waitForElementVisible(toastSuccess);
    }
    
    public void search(String query) {
        type(searchBox, query);
    }

    public boolean isSuccessToastDisplayed() {
        return isDisplayed(toastSuccess);
    }

    private void selectOptionContainingText(By selectLocator, String text) {
        WebElement matchingOption = wait.until(driver -> {
            Select currentSelect = new Select(waitForElementVisible(selectLocator));
            for (WebElement option : currentSelect.getOptions()) {
                if (text.equals(option.getAttribute("value")) || option.getText().contains(text)) {
                    return option;
                }
            }
            return null;
        });

        Select select = new Select(waitForElementVisible(selectLocator));
        if (text.equals(matchingOption.getAttribute("value"))) {
            select.selectByValue(text);
            return;
        }
        if (matchingOption.getText().contains(text)) {
            select.selectByVisibleText(matchingOption.getText());
            return;
        }
        throw new IllegalArgumentException("No option containing text: " + text);
    }
}
