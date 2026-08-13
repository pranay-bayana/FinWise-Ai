package tests;

import base.BaseTest;
import org.json.JSONObject;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;
import pages.DashboardPage;
import pages.ExpensesPage;
import pages.LoginPage;
import utilities.ApiHelper;

public class ExpensesTest extends BaseTest {

    private String baseUrl;

    @BeforeMethod
    public void setupModule() {
        baseUrl = System.getProperty("baseUrl", "http://127.0.0.1:3001");
        
        JSONObject testUser = ApiHelper.createTestUser();
        LoginPage loginPage = new LoginPage(driver);
        driver.get(baseUrl + "/login");
        loginPage.login(testUser.getString("email"), testUser.getString("password"));

        DashboardPage dashboardPage = new DashboardPage(driver);
        Assert.assertTrue(dashboardPage.isLoaded(), "Dashboard did not load after login.");
    }

    @Test
    public void testCreateExpense() {
        ExpensesPage expensesPage = new ExpensesPage(driver);
        expensesPage.navigateTo(baseUrl);

        expensesPage.addExpense("300", "Food", "Rent Payment", "Monthly rent");

        Assert.assertTrue(expensesPage.isSuccessToastDisplayed(), "Success toast should appear after adding expense.");
    }
}
