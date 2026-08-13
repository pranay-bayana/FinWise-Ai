package utilities;

import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import io.restassured.response.Response;
import net.datafaker.Faker;
import org.json.JSONObject;

public class ApiHelper {
    private static final String BASE_URL = "http://127.0.0.1:5001/api";
    private static final Faker faker = new Faker();

    public static JSONObject createTestUser() {
        String uniqueSuffix = String.valueOf(System.currentTimeMillis());
        String email = "auto.user+" + uniqueSuffix + "@example.com";
        String password = "Password123!";
        
        JSONObject requestParams = new JSONObject();
        requestParams.put("fullName", faker.name().fullName());
        requestParams.put("email", email);
        requestParams.put("password", password);
        requestParams.put("phone", faker.phoneNumber().cellPhone());

        Response response = RestAssured.given()
                .contentType(ContentType.JSON)
                .body(requestParams.toString())
                .post(BASE_URL + "/auth/signup");

        if (response.getStatusCode() != 200 && response.getStatusCode() != 201) {
            throw new RuntimeException("Failed to create test user: " + response.getBody().asString());
        }

        JSONObject result = new JSONObject();
        result.put("email", email);
        result.put("password", password);
        result.put("response", new JSONObject(response.getBody().asString()));

        return result;
    }
}
