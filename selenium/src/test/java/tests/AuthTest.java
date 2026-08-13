package tests;

import base.BaseTest;
import org.json.JSONObject;
import org.testng.Assert;
import org.testng.annotations.Test;
import pages.DashboardPage;
import pages.LoginPage;
import pages.RegisterPage;
import utilities.ApiHelper;

public class AuthTest extends BaseTest {

    @Test(priority = 1)
    public void testValidSignup() {
        String uniqueSuffix = String.valueOf(System.currentTimeMillis());
        String email = "auto.signup+" + uniqueSuffix + "@example.com";
        String password = "Password123!";

        RegisterPage registerPage = new RegisterPage(driver);
        driver.get(System.getProperty("baseUrl", "http://127.0.0.1:3001") + "/register");
        
        registerPage.register("Test User", email, password);

        DashboardPage dashboardPage = new DashboardPage(driver);
        Assert.assertTrue(dashboardPage.isLoaded(), "Dashboard did not load after signup.");
    }

    @Test(priority = 2)
    public void testValidLogin() {
        // Create user via API first to avoid UI signup dependency
        JSONObject testUser = ApiHelper.createTestUser();
        
        LoginPage loginPage = new LoginPage(driver);
        driver.get(System.getProperty("baseUrl", "http://127.0.0.1:3001") + "/login");
        
        loginPage.login(testUser.getString("email"), testUser.getString("password"));

        DashboardPage dashboardPage = new DashboardPage(driver);
        Assert.assertTrue(dashboardPage.isLoaded(), "Dashboard did not load after login.");
    }

    @Test(priority = 3)
    public void testInvalidLogin() {
        LoginPage loginPage = new LoginPage(driver);
        driver.get(System.getProperty("baseUrl", "http://127.0.0.1:3001") + "/login");
        
        loginPage.login("invalid@example.com", "WrongPassword!");

        String errorMsg = loginPage.getErrorMessage();
        Assert.assertNotNull(errorMsg, "Error message should be visible.");
        Assert.assertTrue(errorMsg.contains("Invalid"), "Error message should contain 'Invalid'.");
    }
}
