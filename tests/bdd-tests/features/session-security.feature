Feature: Session security for money transfer
  Money must only ever leave the account of the signed-in user. The sender is
  decided by the server session, never by a value the browser can set.

  @security @CZBANK-89 @api
  Scenario: A signed-in user cannot move money out of another user's account
    Given the victim "high.balance@example.com" balance is recorded
    And I am logged in as attacker "zachranNas+brno@pejsekAKocicka.cz" with password "PejsekAKocicka123"
    When I submit a transfer but rewrite the sender to the victim
    Then the victim balance is unchanged
