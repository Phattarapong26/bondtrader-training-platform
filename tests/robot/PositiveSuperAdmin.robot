*** Settings ***
Library    SeleniumLibrary
Library    OperatingSystem
Library    DateTime
Library    resources/OtpLibrary.py
Suite Setup    SignIn-SuperAdmin
Suite Teardown    Close Browser

*** Variables ***
${BROWSER}    chrome
${URL}    http://localhost:5173/
${DELAY}    0
${SCREENSHOT_DIR}    screenshots
${SECRET}    32KZ7QO6I5Q6CGI2K3PJQOOFNMYI46ES

*** Keywords ***
Capture Step Screenshot
    [Arguments]    ${step_name}
    ${timestamp}=    Get Current Date    result_format=%Y%m%d_%H%M%S
    Capture Page Screenshot    ${SCREENSHOT_DIR}/${step_name}_${timestamp}.png

SignIn-SuperAdmin
    Open Browser    ${URL}    ${BROWSER}
    Set Selenium Speed    ${DELAY}
    Maximize Browser Window
    Capture Step Screenshot    admin_login_start
    
    # Select Admin Role
    Wait Until Element Is Visible    xpath=//button[contains(@class, 'role-button') and .//span[text()='ผู้ดูแลระบบ']]
    Click Element    xpath=//button[contains(@class, 'role-button') and .//span[text()='ผู้ดูแลระบบ']]
    Capture Step Screenshot    admin_role_selected
    
    # Input Login Credentials
    Wait Until Element Is Visible    id=email-input
    Input Text    id=email-input    adminMula@gmail.com
    Input Password    id=password-input    65041788
    Capture Step Screenshot    admin_credentials_entered
    
    # Click Login Button
    Click Element    id=login-submit-btn
    
    # Verify Login Success
    Wait Until Element Is Visible    xpath=//div[contains(@class, 'swal2-popup')]
    Element Should Contain    xpath=//h2[contains(@class, 'swal2-title')]    เข้าสู่ระบบสำเร็จ!
    Capture Step Screenshot    admin_login_success

    Go To    http://localhost:5173/AdminDashboard
    Sleep    2s

    Wait Until Element Is Visible    id=user-menu-btn
    Click Element    id=user-menu-btn

    Wait Until Element Is Visible    id=logout-btn
    Click Element    id=logout-btn

    Wait Until Element Is Visible    id=header-logo-link
    Click Element    id=header-logo-link
    Input Text    private-key-input    1111111111111111111111111
    Wait Until Element Is Visible    id=submit-private-key-btn
    Click Element    id=submit-private-key-btn
    ${otp}=    Get Otp    ${SECRET}
    Input Text    id=otp-input    ${otp}
    Wait Until Element Is Visible    id=verify-otp-btn
    Click Element    id=verify-otp-btn
    

Add-SuperAdmin
    Wait Until Element Is Visible    id=add-user-btn
    Click Element    id=add-user-btn
    Input Text    xpath=//*[@id="add-user-modal"]/div/div[1]/input    Test6
    Input Text    xpath=//*[@id="add-user-modal"]/div/div[2]/input    00035
    Input Text    xpath=//*[@id="add-user-modal"]/div/div[3]/input    00035
    Input Text    xpath=//*[@id="add-user-modal"]/div/div[4]/input    000335
    Input Text    xpath=//*[@id="add-user-modal"]/div/div[5]/input    Test160@gmail.com
    Wait Until Element Is Visible    id=confirm-add-btn
    Click Button    id=confirm-add-btn

    Wait Until Element Is Visible    xpath=//div[contains(@class, 'swal2-popup')]
    Element Should Contain    xpath=//h2[contains(@class, 'swal2-title')]    Success
    Click Element    xpath=//button[contains(@class, 'swal2-confirm')]

Edit-Admin
    Wait Until Element Is Visible    id=edit-user-6800d4b0fe6c453f288a8ced
    Click Element    id=edit-user-6800d4b0fe6c453f288a8ced

    # กรอกข้อมูล
    Input Text    xpath=//input[@value='Test']    อทิตยาs
    Input Text    xpath=//input[@value='000']    1111111111112
    Input Text    xpath=//input[@value='000']    1234
    Input Text    xpath=//input[@value='0003']    8888888880
    Input Text    xpath=//input[@value='Test12@gmail.com']    Atitaya@gmail.com

    # คลิกปุ่มอัปเดต
    Wait Until Element Is Visible    xpath=//button[text()='Update Admin']
    Click Element    xpath=//button[text()='Update Admin']

    Wait Until Element Is Visible    xpath=//div[contains(@class, 'swal2-popup')]
    Element Should Contain    xpath=//h2[contains(@class, 'swal2-title')]    Success
    Click Element    xpath=//button[contains(@class, 'swal2-confirm')]

*** Test Cases ***

TC-003-Edit-SuperAdmin
    Edit-Admin
    

TC-004-delete-SuperAdmin
    
    Wait Until Element Is Visible    id=delete-user-6800fd7ce317bfd3809a7cd1
    Click Element    id=delete-user-6800fd7ce317bfd3809a7cd1
    
    Wait Until Element Is Visible    xpath=//div[contains(@class, 'swal2-popup')]
    Element Should Contain    xpath=//h2[contains(@class, 'swal2-title')]    Success
    Click Element    xpath=//button[contains(@class, 'swal2-confirm')]

TC-005-Add-SuperAdmin
    
    Add-SuperAdmin
    

TC-006-Logout
    
    Wait Until Element Is Visible    id=logout-btn
    Click Element    id=logout-btn

