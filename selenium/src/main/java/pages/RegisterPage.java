package pages;

import base.BasePage;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class RegisterPage extends BasePage {

    // Locators
    private final By fullNameInput = By.cssSelector("input[type='text']");
    private final By emailInput = By.cssSelector("input[type='email']");
    private final By passwordInput = By.name("password");
    private final By confirmPasswordInput = By.name("confirmPassword");
    private final By termsCheckbox = By.cssSelector("input[type='checkbox']");
    private final By submitButton = By.cssSelector("button[type='submit']");

    public RegisterPage(WebDriver driver) {
        super(driver);
    }

    public void register(String fullName, String email, String password) {
        type(fullNameInput, fullName);
        type(emailInput, email);
        type(passwordInput, password);
        type(confirmPasswordInput, password);
        click(termsCheckbox);
        click(submitButton);
    }
}
