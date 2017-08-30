
$(document).ready(function () {
    $(document).ajaxStart(function () {
        $("#loading").show();
    }).ajaxStop(function () {
        $("#loading").hide();
    });
});

var _auth_token = null;
var _beneficiary_details = [];
var _buy_currency = null;
var _sell_currency = null;
var _beneficiary_id = null;
var _sell_amount = null;
var _buy_amount = null;
var _reason = null;
var _conversion_id = null;


$("#btn_login").click(function () {
    $.post('https://cors-anywhere.herokuapp.com/https://devapi.currencycloud.com/v2/authenticate/api?login_id=david.brenda@outlook.com&api_key=614639d38441e0b27385aaf0f81ed9a491826097e2992e083e8b33334bd3fdcb', function (json) {
    _auth_token = json.auth_token;
    availableCurrencies(_auth_token);
    $('#intro').addClass('hidden');
    $('#page1').removeClass('hidden');
}).fail(function () {
    alert('Error logging in. Please try again.');
    });
});


$("#btn_rate").click(function () {
    var _buy_currency = $("#ddlBuyCurrency").val();
    var _sell_currency = $("#ddlSellCurrency").val();
    var _fixed_side = $('input[name=fixedSide]:checked').val();
    var _amount = $("#amount").val();
    detailedRates(_buy_currency, _sell_currency, _fixed_side, _amount);
});

$("#btn_proceed").click(function () {
    $('#additionalDetails').removeClass('hidden');
})

$("#btn_convert").click(function () {
    _buy_currency = $("#ddlBuyCurrency").val();
    _sell_currency = $("#ddlSellCurrency").val();
    var _fixed_side = $('input[name=fixedSide]:checked').val();
    var _amount = $("#amount").val();
    _reason = $("#reason").val();
    var _term_agreement = $('#termAgreement').val();
    createConversion(_buy_currency, _sell_currency, _fixed_side, _amount, _reason, _term_agreement);
});


$('#termAgreement').click(function () {
    if ($(this).is(':checked')) {
        $('#btn_convert').removeAttr('disabled');
        $('#btn_convert').addClass('btn-form');
    } else {
        $('#btn_convert').attr('disabled', true);
        $('#btn_convert').removeClass('btn-form');
    }
});


$('#btn_next').click(function () {
    $('#page1').addClass('hidden');
    $('#page2').removeClass('hidden');
    findBeneficiary();
});


$('#btn_cancel').click(function () {
    $('#page3').addClass('hidden');
    $('#page2').removeClass('hidden');
    $('#ddlBankAccountCountry').val(0);
    $('#ddlBankAccountCurrency').val(0);
    $('input[name=paymentType]').prop('checked', false);
    $('input[name=paymentType]').prop('disabled', true);
    $('input[name=entityType]').prop('checked', false);
    $('#page3 input[type=text]').val('');
    $('#beneficiaryPaymentType').addClass('hidden');
    $('#beneficiaryRequiredDetails').addClass('hidden');
    $('.optional div').addClass('hidden');
});


$('#ddlBankAccountCountry').change(function () {
    $('input[name=paymentType]').prop('checked', false);
    $('input[name=paymentType]').prop('disabled', true);
    $('input[name=entityType]').prop('checked', false);
});

$('#ddlBankAccountCurrency').change(function () {
    var _bank_account_country = $("#ddlBankAccountCountry").val();
    var _beneficiary_currency = $("#ddlBankAccountCurrency").val();
    beneficiaryRequiredDetails(_beneficiary_currency, _bank_account_country);
    $('#beneficiaryPaymentType').removeClass('hidden');
});



$('input[type=radio][name=entityType]').change(function () {
    var returnedData = $.grep(_beneficiary_details.details, function (k, i) {
        return k.payment_type == $('input[type=radio][name=paymentType]:checked').val() && k.beneficiary_entity_type == $('input[type=radio][name=entityType]:checked').val();
    });

    //alert(JSON.stringify(returnedData));

    if (returnedData[0].hasOwnProperty('acct_number')) {
        $('#gp_accountNumber').removeClass('hidden');
        $('#accountNumber').attr('pattern', returnedData[0].acct_number);
    };
    if (returnedData[0].hasOwnProperty('sort_code')) {
        $('#gp_sortCode').removeClass('hidden');
        $('#sortCode').attr('pattern', returnedData[0].sort_code);
    };
    if (returnedData[0].hasOwnProperty('bic_swift')) {
        $('#gp_bicSwift').removeClass('hidden');
        $('#bicSwift').attr('pattern', returnedData[0].bic_swift);
    };
    if (returnedData[0].hasOwnProperty('iban')) {
        $('#gp_iban').removeClass('hidden');
        $('#iban').attr('pattern', returnedData[0].iban);
    };
    if (returnedData[0].hasOwnProperty('beneficiary_first_name')) {
        $('#gp_beneficiaryFirstName').removeClass('hidden');
        $('#beneficiaryFirstName').attr('pattern', returnedData[0].beneficiary_first_name);
    };
    if (returnedData[0].hasOwnProperty('beneficiary_last_name')) {
        $('#gp_beneficiaryLastName').removeClass('hidden');
        $('#beneficiaryLastName').attr('pattern', returnedData[0].beneficiary_last_name);
    };
    if (returnedData[0].hasOwnProperty('beneficiary_company_name')) {
        $('#gp_beneficiaryCompanyName').removeClass('hidden');
        $('#beneficiaryCompanyName').attr('pattern', returnedData[0].beneficiary_company_name);
    };
    if (returnedData[0].hasOwnProperty('beneficiary_address')) {
        $('#gp_beneficiaryAddress').removeClass('hidden');
        $('#beneficiaryAddress').attr('pattern', returnedData[0].beneficiary_address);
    };
    if (returnedData[0].hasOwnProperty('beneficiary_city')) {
        $('#gp_beneficiaryCity').removeClass('hidden');
        $('#beneficiaryCity').attr('pattern', returnedData[0].beneficiary_city);
    };
    if (returnedData[0].hasOwnProperty('beneficiary_country')) {
        $('#gp_beneficiaryCountry').removeClass('hidden');
        $('#beneficiaryCountry').attr('pattern', returnedData[0].beneficiary_country);
    };
    if (returnedData[0].hasOwnProperty('beneficiary_address')) {
        $('#gp_beneficiaryAddress').removeClass('hidden');
        $('#beneficiaryAddress').attr('pattern', returnedData[0].beneficiary_address);
    };

    $('#beneficiaryRequiredDetails').removeClass('hidden');
});


$('#btn_create').click(function () {
    var _bank_account_holder_name = $("#bankAccountHolderName").val();
    var _bank_country = $("#ddlBankAccountCountry").val();
    var _beneficiary_currency = $("#ddlBankAccountCurrency").val();
    var _buy_currency = $("#ddlBuyCurrency").val();
    var _name = $("#name").val();
    if ($("#accountNumber").val() != '') {
        var _account_number = $('#accountNumber').val();
    } else {
        var _account_number = "12345678";
    };
    if ($("#sortCode").val() != '') {
        var _routing_code_type_1 = 'sort_code';
        var _routing_code_value_1 = $("#sortCode").val();
    } else {
        var _routing_code_type_1 = 'sort_code';
        var _routing_code_value_1 = '123456';
    };
    if ($("#bicSwift").val() != '') {
        var _bic_swift = $('#bicSwift').val();
    } else {
        var _bic_swift = "AAAAAAAAAAA";
    };
    if ($("#iban").val() != '') {
        var _iban = $('#iban').val();
    } else {
        var _iban = "0000 0000 0000 0000 0000 0000 000";
    };
    createBeneficiary(_bank_account_holder_name, _bank_country, _beneficiary_currency, _name, _account_number, _routing_code_type_1, _routing_code_value_1, _bic_swift, _iban);
});

$('#btn_createNewBeneficiary').click(function () {
    $('#page2').addClass('hidden');
    $('#page3').removeClass('hidden');
    countries();
});


$('#btn_makePayment').click(function () {
    var _payment_currency = $('#ddlPaymentCurrency').val();
    var _beneficiary_id = $('#id').val();
    var _payment_amount = $('#paymentAmount').val();
    var _reason = $('#reason').val();
    var _reference = $('#reference').val();
    var _payment_type = $('#paymentType').val();
    createPayment(_payment_currency, _beneficiary_id, _payment_amount, _reason, _reference, _conversion_id, _payment_type);
});


$('#btn_deleteBeneficiary').click(function () {
    deleteBeneficiary(_beneficiary_id);
});



$('#amount').on('keyup', function () {
    if ($(this).val() != '') {
        $('#btn_rate').removeAttr('disabled');
        $('#btn_rate').addClass('btn-form');
    } else {
        $('#btn_rate').attr('disabled', true);
        $('#btn_rate').removeClass('btn-form');
    }
});


function isNumber(evt) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 31 && charCode != 46 && (charCode < 48 || charCode > 57)) {
        alert('Please enter a number');
        return false;
    }
    return true;
};


var availableCurrencies = function (_auth_token) {
    $.ajax({
        type: "GET",
        url: "https://cors-anywhere.herokuapp.com/https://devapi.currencycloud.com/v2/reference/currencies",
        headers: { "X-AUTH-TOKEN": _auth_token },
        success: function (json) {
            var listItems = "<option disabled selected value='0'>Select currency...</option>";
            for (var i = 0; i < json.currencies.length; i++) {
                listItems += "<option value='" + json.currencies[i].code + "'>" + json.currencies[i].code + ' - ' + json.currencies[i].name + "</option>";
            }
            $("#ddlSellCurrency").html(listItems);
            $("#ddlBuyCurrency").html(listItems);
            $("#ddlBankAccountCurrency").html(listItems);
            $("#ddlPaymentCurrency").html(listItems);
        }
    });
};

var detailedRates = function (_buy_currency, _sell_currency, _fixed_side, _amount) {
    $.ajax({
        type: "GET",
        url: "https://cors-anywhere.herokuapp.com/https://devapi.currencycloud.com/v2/rates/detailed",
        data: {
            buy_currency: _buy_currency,
            sell_currency: _sell_currency,
            fixed_side: _fixed_side,
            amount: _amount
        },
        headers: { "X-AUTH-TOKEN": _auth_token },
        success: function (json) {
            $('#rate').removeClass('hidden');
            if (json.fixed_side == 'sell') {
                $('#rate p:eq(0)').html('Selling <span class="highlight">' + json.client_sell_currency + ' ' + json.client_sell_amount + '</span> at a rate of <span class="highlight">' + json.client_sell_currency + ' 1 = ' + json.client_buy_currency + ' ' + json.client_rate + '</span> will buy <span class="highlight">' + json.client_buy_currency + ' ' + json.client_buy_amount + '</span>');
            }
            else if (json.fixed_side == 'buy') {
                $('#rate p:eq(0)').html('Buying <span class="highlight">' + json.client_buy_currency + ' ' + json.client_buy_amount + '</span> at a rate of <span class="highlight">' + json.client_sell_currency + ' 1 = ' + json.client_buy_currency + ' ' + json.client_rate + '</span> will require selling <span class="highlight">' + json.client_sell_currency + ' ' + json.client_sell_amount + '</span>');
            }
        }
    });
}


var createConversion = function (_buy_currency, _sell_currency, _fixed_side, _amount, _reason, _term_agreement) {
    $.ajax({
        type: "POST",
        url: "https://cors-anywhere.herokuapp.com/https://devapi.currencycloud.com/v2/conversions/create",
        data: {
            buy_currency: _buy_currency,
            sell_currency: _sell_currency,
            fixed_side: _fixed_side,
            amount: _amount,
            reason: _reason,
            term_agreement: _term_agreement
        },
        headers: { "X-AUTH-TOKEN": _auth_token },
        success: function (json) {
            _conversion_id = json.id;
            _sell_amount = json.client_sell_amount;
            $('#additionalDetails p:eq(1)').html('<p><span class="highlight">Congratulations!</span> A conversion has been set up with status: <span class="highlight">' + json.status + '</span></p><p>The funds must be transferred by <span class="highlight">' + json.settlement_date + '</span></p><p>Click next to transfer the funds to a beneficiary account</p>');
            $('#next').removeClass('hidden');
            _buy_amount = json.client_buy_amount;
        }
    });
}

var countries = function () {
    $.ajax({
        type: "GET",
        url: "https://restcountries.eu/rest/v2/all?fields=name;alpha2Code",
        data: {},
        success: function (json) {
            var listItems = "<option disabled selected value=''>Select country...</option>";
            for (var i = 0; i < json.length; i++) {
                listItems += "<option value='" + json[i].alpha2Code + "'>" + json[i].name + "</option>";
            }
            $("#ddlBankAccountCountry").html(listItems);
            $("#ddlBeneficiaryCountry").html(listItems);
        }
    });
}


var beneficiaryRequiredDetails = function (_beneficiary_currency, _bank_account_country) {
    $.ajax({
        type: "GET",
        url: "https://cors-anywhere.herokuapp.com/https://devapi.currencycloud.com/v2/reference/beneficiary_required_details",
        data: {
            currency: _beneficiary_currency,
            bank_account_country: _bank_account_country
        },
        headers: { "X-AUTH-TOKEN": _auth_token },
        success: function (json) {
            for (var i = 0; i < json.details.length; i++) {
                if (json.details[i].payment_type == "priority") {
                    $('#rdPriority').removeAttr('disabled');
                };
                if (json.details[i].payment_type == "regular") {
                    $('#rdRegular').removeAttr('disabled');
                    break;
                };
            }
            _beneficiary_details = json;
        }
    });
}


var createBeneficiary = function (_bank_account_holder_name, _bank_country, _beneficiary_currency, _name, _account_number, _routing_code_type_1, _routing_code_value_1, _bic_swift, _iban) {
    $.ajax({
        type: "POST",
        url: "https://cors-anywhere.herokuapp.com/https://devapi.currencycloud.com/v2/beneficiaries/create",
        data: {
            bank_account_holder_name: _bank_account_holder_name,
            bank_country: _bank_country,
            currency: _beneficiary_currency,
            name: _name,
            account_number: _account_number,
            routing_code_type_1: _routing_code_type_1,
            routing_code_value_1: _routing_code_value_1,
            bic_swift: _bic_swift,
            iban: _iban
        },
        headers: { "X-AUTH-TOKEN": _auth_token },
        success: function (json) {
            $('#table').empty();
            findBeneficiary();
            $('#page3').addClass('hidden');
            $('#page2').removeClass('hidden');
            $('#ddlBankAccountCountry').val(0);
            $('#ddlBankAccountCurrency').val(0);
            $('input[name=paymentType]').prop('checked', false);
            $('input[name=paymentType]').prop('disabled', true);
            $('input[name=entityType]').prop('checked', false);
            $('#page3 input[type=text]').val('');
            $('#beneficiaryPaymentType').addClass('hidden');
            $('#beneficiaryRequiredDetails').addClass('hidden');
            $('.optional div').addClass('hidden');
        }
    });
}


var deleteBeneficiary = function (_beneficiary_id) {
    $.ajax({
        type: "POST",
        url: "https://cors-anywhere.herokuapp.com/https://devapi.currencycloud.com/v2/beneficiaries/" + _beneficiary_id + "/delete",
        data: {},
        headers: { "X-AUTH-TOKEN": _auth_token },
        success: function (json) {
            $('#table').empty();
            findBeneficiary();
            $('#btn_deleteBeneficiary').prop('disabled', 'disabled');
            $('#btn_deleteBeneficiary').removeClass('btn-form');
        }
    });
}


var findBeneficiary = function () {
    $.ajax({
        type: "GET",
        url: "https://cors-anywhere.herokuapp.com/https://devapi.currencycloud.com/v2/beneficiaries/find",
        data: {},
        headers: { "X-AUTH-TOKEN": _auth_token },
        success: function (json) {
            var $table = $("<table class='table' />");
            $table.append('<thead><tr><th>Account Holder</th><th>Reference</th><th>Account Number</th><th>Currency</th><th class="hidden">ID</th></tr></thead><tbody>');
            for (var i = 0; i < json.beneficiaries.length; i++) {
                $table.append('<tr><td>' + json.beneficiaries[i].bank_account_holder_name + '</td><td>' + json.beneficiaries[i].name + '</td><td>' + json.beneficiaries[i].account_number + '</td><td>' + json.beneficiaries[i].currency + '</td><td class="id hidden">' + json.beneficiaries[i].id + '</td></tr>');
            }
            $table.append('</tbody>');
            $('#table').append($table);

            $("tbody tr").click(function () {
                $('.selected').removeClass('selected');
                $(this).addClass("selected");
                var _id = $('.id', this).html();
                retrieveBeneficiary(_id);
            });
        }
    });
}


var retrieveBeneficiary = function (_id) {
    $.ajax({
        type: "GET",
        url: "https://cors-anywhere.herokuapp.com/https://devapi.currencycloud.com/v2/beneficiaries/" + _id,
        data: {},
        headers: { "X-AUTH-TOKEN": _auth_token },
        success: function (json) {
            $('#id').val(json.id);
            $('#bankAccountHolderName').val(json.bank_account_holder_name);
            $('#paymentType').val(json.payment_types);
            $('#reference').val(json.name);
            $('#ddlPaymentCurrency').val(_buy_currency);
            $('#paymentAmount').val(_buy_amount);

            _beneficiary_id = json.id;
            $('#btn_deleteBeneficiary').removeAttr('disabled');
            $('#btn_deleteBeneficiary').addClass('btn-form');
            $('#beneficiaryDetails').removeClass('hidden');
        }
    });
}



var createPayment = function (_payment_currency, _beneficiary_id, _payment_amount, _reason, _reference, _conversion_id, _payment_type) {
    $.ajax({
        type: "POST",
        url: "https://cors-anywhere.herokuapp.com/https://devapi.currencycloud.com/v2/payments/create",
        data: {
            currency: _payment_currency,
            beneficiary_id: _beneficiary_id,
            amount: _payment_amount,
            reason: _reason,
            reference: _reference,
            conversion_id: _conversion_id,
            payment_type: _payment_type
        },
        headers: { "X-AUTH-TOKEN": _auth_token },
        success: function (json) {
            $('#page2').addClass('hidden');
            $('#page4').removeClass('hidden');
        }
    });
}