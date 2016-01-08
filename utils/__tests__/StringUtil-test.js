jest.dontMock('../StringUtil');

var StringUtil = require('../StringUtil');

describe('StringUtil', function () {

  describe('#capitalize', function () {

    it('capitalizes the string correctly', function () {
      expect(StringUtil.capitalize('kenny')).toEqual('Kenny');
    });

    it('returns null if input is not a string', function () {
      expect(StringUtil.capitalize(10)).toEqual(null);
    });

    it('does nothing if string is already capitalized', function () {
      var capitalizedString = 'Name';
      expect(StringUtil.capitalize(capitalizedString))
        .toEqual(capitalizedString);
    });
  });

});
