package pages;

import base.BasePage;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class DashboardPage extends BasePage {

    // Locators
    private final By menuButton = By.cssSelector("button[aria-label='Open menu']");
    private final By signOutButton = By.xpath("//button[contains(., 'Sign Out')]");
    private final By financialHealthTitle = By.xpath("//*[contains(text(), 'Financial Health')]");

    public DashboardPage(WebDriver driver) {
        super(driver);
    }

    public void logout() {
        click(menuButton);
        click(signOutButton);
    }

    public boolean isLoaded() {
        return isDisplayed(financialHealthTitle);
    }
}
