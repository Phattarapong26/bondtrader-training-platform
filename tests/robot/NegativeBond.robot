*** Settings ***
Library    SeleniumLibrary
Library    OperatingSystem
Library    DateTime
Library    resources/OtpLibrary.py

Suite Setup    LogIn
Suite Teardown    Close Browser

*** Variables ***
${BROWSER}    chrome
${URL}    http://localhost:5173/
${DELAY}    0
${SCREENSHOT_DIR}    screenshots
*** Keywords ***
Capture Step Screenshot
    [Arguments]    ${step_name}
    ${timestamp}=    Get Current Date    result_format=%Y%m%d_%H%M%S
    Capture Page Screenshot    ${SCREENSHOT_DIR}/${step_name}_${timestamp}.png

SignupDuplicate
    Open Browser    ${URL}    ${BROWSER}
    Set Selenium Speed    ${DELAY}
    Maximize Browser Window
    Wait Until Element Is Visible    id=role-btn-trader
    Click Element    id=role-btn-trader

    Wait Until Element Is Visible    id=signup-btn
    Click Element    id=signup-btn
    Input Text    id=name-input    Phattarapong Uknowme
    Input Text    id=company-input    Uknowme Asset
    Input Text    id=citizen-id-input    1429900959405
    Input Text    id=email-input    phattarapong@gmail.com
    Input Text    id=phone-input    0966566414
    Wait Until Element Is Visible    id=submit-signup-btn
    Click Element    id=submit-signup-btn
    
    # Confirm Registration Success
    Wait Until Element Is Visible    xpath=//div[contains(@class, 'swal2-popup')]
    Element Should Contain    xpath=//h2[contains(@class, 'swal2-title')]    ไม่สามารถลงทะเบียนได้
    Click Element    xpath=//button[contains(@class, 'swal2-confirm')]
    [Teardown]    Close Browser

SignupIncomplete
    Open Browser    ${URL}    ${BROWSER}
    Set Selenium Speed    ${DELAY}
    Maximize Browser Window
    Wait Until Element Is Visible    id=role-btn-trader
    Click Element    id=role-btn-trader

    Wait Until Element Is Visible    id=signup-btn
    Click Element    id=signup-btn
    Input Text    id=name-input    Phattarapong Uknowme
    Input Text    id=company-input    Uknowme Asset
    Input Text    id=citizen-id-input    1429900959405
    Input Text    id=email-input    phattarapong@gmail.com
    Wait Until Element Is Visible    id=submit-signup-btn
    Click Element    id=submit-signup-btn

LogIn
    Open Browser    ${URL}    ${BROWSER}
    Set Selenium Speed    ${DELAY}
    Maximize Browser Window
    Capture Step Screenshot    user_login_start
    
    # Select User Role
    Wait Until Element Is Visible    xpath=//button[contains(@class, 'role-button') and .//span[text()='ผู้ค้าตราสารหนี้']]
    Click Element    xpath=//button[contains(@class, 'role-button') and .//span[text()='ผู้ค้าตราสารหนี้']]
    Capture Step Screenshot    user_role_selected
    
    # Input Login Credentials
    Wait Until Element Is Visible    id=email-input
    Input Text    id=email-input    phattarapong@gmail.com
    Input Password    id=password-input    12345
    Capture Step Screenshot    user_credentials_entered
    
    # Click Login Button
    Click Element    id=login-submit-btn
    
    # Verify Login Success
    Wait Until Element Is Visible    xpath=//div[contains(@class, 'swal2-popup')]
    Element Should Contain    xpath=//h2[contains(@class, 'swal2-title')]    เข้าสู่ระบบสำเร็จ!
    Click Element    xpath=//button[contains(@class, 'swal2-confirm')]
    Capture Step Screenshot    user_login_success

LoginI
    Open Browser    ${URL}    ${BROWSER}
    Set Selenium Speed    ${DELAY}
    Maximize Browser Window
    
    
    # Select User Role
    Wait Until Element Is Visible    xpath=//button[contains(@class, 'role-button') and .//span[text()='ผู้ค้าตราสารหนี้']]
    Click Element    xpath=//button[contains(@class, 'role-button') and .//span[text()='ผู้ค้าตราสารหนี้']]
    
    
    # Input Login Credentials
    Wait Until Element Is Visible    id=email-input
    Input Text    id=email-input    phattarapong@gmail.com
    Input Password    id=password-input    132990095940
    
    
    # Click Login Button
    Click Element    id=login-submit-btn
    
    # Verify Login Success
    Wait Until Element Is Visible    xpath=//div[contains(@class, 'swal2-popup')]
    Element Should Contain    xpath=//h2[contains(@class, 'swal2-title')]    เกิดข้อผิดพลาด
    Click Element    xpath=//button[contains(@class, 'swal2-confirm')]
    

Profile
    Wait Until Element Is Visible    xpath=//*[@id="user-menu-btn"]
    Click Element    xpath=//*[@id="user-menu-btn"]

Homepage
    Go To    http://localhost:5173/UserHomepage
    Sleep    2s 

*** Test Cases ***
TCI001-การสมัครสมาชิก(ข้อมูลไม่ครบ)
    SignupDuplicate

TCI002-การสมัครสมาชิก(ข้อมูลซ้ำ)
    SignupIncomplete

TCI003-เข้าสู่ระบบของผูู้ค้าตราสารหนี้
    LoginI

TCI004-แก้ไขข้อมูลโปรไฟล์
    LogIn
    Homepage
    Profile

    Wait Until Element Is Visible    xpath=//*[@id="profile-btn"]
    Click Element    xpath=//*[@id="profile-btn"]

    # Edit Profile Information
    Wait Until Element Is Visible    id=edit-profile-btn
    Click Element    id=edit-profile-btn

    Choose File    id=profile-picture-input    ${CURDIR}/image/1.webp

    Wait Until Element Is Visible    id=save-profile-btn
    Click Element    id=save-profile-btn

    Wait Until Element Is Visible    xpath=//div[contains(@class, 'swal2-popup')]
    Element Should Contain    xpath=//h2[contains(@class, 'swal2-title')]    Update Failed
    Click Element    xpath=//button[contains(@class, 'swal2-confirm')]
    Wait Until Element Is Visible    id=close-profile-btn
    Click Button     id=close-profile-btn

TCI005-เปลี่ยนรหัสผ่าน

    Profile

    Wait Until Element Is Visible    id=change-password-btn
    Click Element    id=change-password-btn
    Input Password    id=swal-new-password    12345

    Wait Until Element Is Visible    xpath=//div[contains(@class, 'swal2-popup')]
    Element Should Contain    xpath=//h2[contains(@class, 'swal2-title')]    เปลี่ยนรหัสผ่าน
    Click Element    xpath=//button[contains(@class, 'swal2-confirm')]
    Sleep    3s
    Wait Until Element Is Visible    xpath=//div[contains(@class, 'swal2-popup')]
    Element Should Contain    xpath=//h2[contains(@class, 'swal2-title')]    ผิดพลาด
    Click Element    xpath=//button[contains(@class, 'swal2-confirm')]
    

TCI006-ลงทะเบียนคอร์ส(ที่นั่งเต็ม)

    Wait Until Element Is Visible    xpath=//*[@id="course-card-6709c570c628150b54faeab8"]
    Click Element    xpath=//*[@id="course-card-6709c570c628150b54faeab8"]
    Wait Until Element Is Visible    id=register-course-btn
    Click Element    id=register-course-btn
    Wait Until Element Is Visible    xpath=//div[contains(@class, 'swal2-popup')]
    Element Should Contain    xpath=//h2[contains(@class, 'swal2-title')]    เกิดข้อผิดพลาด
    Click Element    xpath=//button[contains(@class, 'swal2-confirm')]


