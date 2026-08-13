package pages;

import base.BasePage;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class LoginPage extends BasePage {

    // Locators
    private final By emailInput = By.cssSelector("input[type='email']");
    private final By passwordInput = By.cssSelector("input[type='password']");
    private final By loginButton = By.cssSelector("button[type='submit']");
    private final By errorMessage = By.cssSelector("[role='status'], [role='alert'], .text-red-500");
    private final By googleLoginButton = By.xpath("//button[contains(., 'Google')]");

    public LoginPage(WebDriver driver) {
        super(driver);
    }

    public void login(String email, String password) {
        type(emailInput, email);
        type(passwordInput, password);
        click(loginButton);
    }

    public String getErrorMessage() {
        if (isDisplayed(errorMessage)) {
            return getText(errorMessage);
        }
        return null;
    }

    public boolean isGoogleLoginButtonVisible() {
        return isDisplayed(googleLoginButton);
    }
}
