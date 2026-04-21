const { createReminder } = require('./googleService');

function getEligibilityDateFromAge(age) {
  const yearsLeft = 18 - age;
  const roundedYearsLeft = Math.ceil(yearsLeft);

  if (roundedYearsLeft <= 0) {
    return 'now';
  }

  if (roundedYearsLeft <= 1) {
    return 'within about 1 year';
  }

  return `in about ${roundedYearsLeft} years`;
}

function getElectionGuidance({ age, hasVoterID, movedCity }) {
  if (age < 18) {
    const eligibilityWindow = getEligibilityDateFromAge(age);
    const reminder = createReminder('Register to vote in India', eligibilityWindow);

    return {
      status: 'ineligible',
      message: `You are not eligible to vote yet. You can register when you turn 18 (${eligibilityWindow}).`,
      steps: [
        '1. Keep a valid proof of age (birth certificate, school certificate, or passport).',
        '2. Keep your address proof ready for future voter registration.',
        `3. Set a reminder to apply on NVSP when you turn 18. ${reminder.message}`
      ],
      timeline: `Expected eligibility ${eligibilityWindow}`,
      nextAction: 'Wait until age 18 and then apply for voter registration on NVSP.'
    };
  }

  if (!hasVoterID) {
    return {
      status: 'eligible',
      message: 'You are eligible to vote, but you need to register for a voter ID first.',
      steps: [
        '1. Go to NVSP (National Voters’ Service Portal) and choose new voter registration (Form 6).',
        '2. Fill your personal details exactly as in your official documents.',
        '3. Upload required documents: age proof, address proof, and passport-size photo.',
        '4. Submit the application and save the reference number for tracking.',
        '5. Track status on NVSP until your voter ID is approved.'
      ],
      timeline: 'Usually 2-4 weeks for verification and voter ID generation.',
      nextAction: 'Complete Form 6 on NVSP today and keep your reference number safe.'
    };
  }

  if (movedCity) {
    return {
      status: 'eligible',
      message: 'You are eligible to vote, but your voter details should be updated to your new city.',
      steps: [
        '1. Visit NVSP and select voter transfer/address update (Form 8).',
        '2. Enter your EPIC number and new residential address details.',
        '3. Upload your new address proof and submit the request.',
        '4. Track the request on NVSP and wait for booth reassignment confirmation.',
        '5. Verify your name in the updated electoral roll before election day.'
      ],
      timeline: 'Usually 2-4 weeks for address verification and transfer.',
      nextAction: 'Submit Form 8 on NVSP to transfer your voter record to the new city.'
    };
  }

  return {
    status: 'eligible',
    message: 'You are eligible and your voter ID appears ready for voting.',
    steps: [
      '1. Check your name in the electoral roll on NVSP before voting day.',
      '2. Find your polling booth details using NVSP or the Voter Helpline app.',
      '3. Keep your voter ID (EPIC) or other approved ID proof ready.',
      '4. Reach the polling booth during voting hours and follow queue instructions.',
      '5. Verify your vote carefully on the EVM/VVPAT screen before leaving.'
    ],
    timeline: 'Ready now; complete checklist before election day.',
    nextAction: 'Confirm your polling booth location and keep your ID ready.'
  };
}

module.exports = {
  getElectionGuidance
};
