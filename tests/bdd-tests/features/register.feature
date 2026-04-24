Feature: Register user
  This feature tests user registration functionality

  Background:
    Given I am on the registration page

  @smoke
  @register
  @happy-path
  @CZBANK-T3
  @general
  Scenario: CZBANK-T3_Register user with valid data
    When I generate unique user data
    When I fill name with generated value
    And I fill email with generated value
    And I fill registration password "12345678"
    And I fill confirm password "12345678"
    And I click register button
    Then I am redirected to "RegisterSuccessPage"
    And I should see a message "Registration Successful!"
    Then I click Continue to the app button
    And I am redirected to "Dashboard"
    And I should see welcome message for generated user


