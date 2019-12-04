import moment from 'moment-timezone';
import axios from 'axios';

const TOKEN_URL = "https://login.bisnode.com/as/token.oauth2";
const SEARCH_URL = "https://api.bisnode.com/consumerintelligence/person/v2/"
const SCOPE = "grant_type=client_credentials&scope=bci"

const tokenGetter = ({ clientId, clientSecret }) => {

    let currentTokenInfo = null;

    return async () => {
        if (currentTokenInfo && moment().isBefore(currentTokenInfo.expiresAt)) {
            return currentTokenInfo.token;
        }

        const options = {
            method: 'POST',
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            data: SCOPE,
            url: TOKEN_URL,
            auth: {
                username: clientId,
                password: clientSecret
            }
        };

        const { access_token: token, expires_in } = await axios(options).then(r => r.data);

        currentTokenInfo = {
            token,
            expiresAt: moment().add(expires_in - 10, 'seconds')
        }

        return token;
    }
}

const personResultMapper = (bisnodePerson) => {
    const { gedi,
        firstNames,
        familyName,
        gender,
        dateOfBirth,
        yearOfBirth,
        deceased,
        communicationLanguageScript,
        directMarketingRestriction,
        phoneList,
        addressList } = bisnodePerson.person;

    const address = addressList[0];
    const phoneNumber = phoneList[0] && phoneList[0].number;

    return {
        gedi,
        firstName: firstNames.reduce((p, c) => `${p} ${c}`, '').trim(),
        lastName: familyName,
        gender,
        dateOfBirth,
        yearOfBirth,
        deceased: !!deceased,
        language: languageMap[communicationLanguageScript] || (address && countryLanguageMap[address.country]) || 'en-US',        
        directMarketingRestriction: !!directMarketingRestriction,
        phoneNumber,
        address
    };
}

const languageMap = {
    "nb-Latn-NO": "nb-NO",
    "sv-Latn-SE": "sv-SE"
}

const countryLanguageMap = {
    "NO": "nb-NO",
    "SE": "sv-SE"
}

const searchParamsMapper = (searchObj) => {

    const {
        firstName,
        familyName,
        dateOfBirth,
        yearOfBirth,
        phoneNumber,
        streetAddress,
        postalCode,
        city,
        lastName,
        country,
        legalId,
        ssn,
        sourceCountry } = searchObj;

    const searchPayload = {
        firstName,
        familyName: lastName || familyName,
        dateOfBirth,
        yearOfBirth,
        phoneNumber,
        streetAddress,
        postalCode,
        city,
        sourceCountry: country || sourceCountry,
        legalId: ssn || legalId
    }

    if (!searchPayload.sourceCountry) {
        throw new Exception('"country" or "sourceCountry" is missing');
    }

    return searchPayload;
}

const searchFunc = ({ getToken }) => {

    return async (params) => {
        const token = await getToken()
        return await axios({
            method: "GET",
            headers: {
                'Authorization': `Bearer ${token}`
            },
            params: searchParamsMapper(params),
            url: SEARCH_URL
        }).then(r => r.data)
            .catch(err => {
                throw err.response.data;
            });
    }
}

export default ({ clientId, clientSecret }) => {

    const getToken = tokenGetter({ clientId, clientSecret });
    const searchRaw = searchFunc({ getToken });
    const search = (params) => searchRaw(params).then(r => r.persons.map(personResultMapper));
    const searchOne = (params) => search(params).then(r => r[0]);

    return {
        search,
        searchOne,
        searchRaw
    }
}