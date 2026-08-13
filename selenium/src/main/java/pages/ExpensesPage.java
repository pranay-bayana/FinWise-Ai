package pages;

import base.BasePage;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.Select;

public class ExpensesPage extends BasePage {

    private final By addExpenseButton = By.xpath("//main//button[contains(., 'Add Expense')]");
    private final By amountInput = By.cssSelector("form input[type='number']");
    private final By categorySelect = By.cssSelector("form select");
    private final By descriptionInput = By.cssSelector("form input[placeholder='What did you spend on?']");
    private final By notesTextarea = By.cssSelector("form textarea");
    private final By submitButton = By.cssSelector("form button[type='submit']");
    private final By searchBox = By.cssSelector("input[placeholder*='Search']");
    private final By toastSuccess = By.xpath("//*[@role='status' and contains(., 'successfully')]");

    public ExpensesPage(WebDriver driver) {
        super(driver);
    }

    public void navigateTo(String baseUrl) {
        driver.get(baseUrl + "/expenses");
    }

    public void addExpense(String amount, String category, String description, String notes) {
        click(addExpenseButton);
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
