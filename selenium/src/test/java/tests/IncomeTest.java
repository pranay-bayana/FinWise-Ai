package tests;

import base.BaseTest;
import org.json.JSONObject;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;
import pages.DashboardPage;
import pages.IncomePage;
import pages.LoginPage;
import utilities.ApiHelper;

public class IncomeTest extends BaseTest {

    private String baseUrl;

    @BeforeMethod
    public void setupModule() {
        baseUrl = System.getProperty("baseUrl", "http://127.0.0.1:3001");
        
        // Setup isolated user and login
        JSONObject testUser = ApiHelper.createTestUser();
        LoginPage loginPage = new LoginPage(driver);
        driver.get(baseUrl + "/login");
        loginPage.login(testUser.getString("email"), testUser.getString("password"));

        DashboardPage dashboardPage = new DashboardPage(driver);
        Assert.assertTrue(dashboardPage.isLoaded(), "Dashboard did not load after login.");
    }

    @Test
    public void testCreateIncome() {
        IncomePage incomePage = new IncomePage(driver);
        incomePage.navigateTo(baseUrl);

        String desc = "Consulting Fee";
        incomePage.addIncome("15000", "Salary", desc, "Q2 consulting");

        Assert.assertTrue(incomePage.isSuccessToastDisplayed(), "Success toast should appear after adding income.");
    }
}
