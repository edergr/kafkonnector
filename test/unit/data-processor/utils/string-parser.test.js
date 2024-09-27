const assert = require('assert');
const stringParser = require('../../../../lib/data-processor/utils/string-parser');

describe('String Parser unit test', () => {
  describe('Success Cases', () => {
    it('Should apply the string parser successfully', () => {
      const lines = [
        '119981330000999941141103   000SP        00019MN2005112620040401        ',
        '111 20141883195601101103031000SPSPO 011 11000FN2005112619980425        ',
        '131988365828582843043001   000MG        00031MN202303312023033120240101',
      ];
      const propertiesPosition = [
        0, 1, 3, 8, 12, 16, 19, 22, 26, 30,
        32, 36, 40, 45, 46, 47, 55, 63
      ];

      const expectedResult = [
        '1;19;98133;0000;9999;411;411;03  ; 000;SP;    ;    ;00019;M;N;20051126;20040401;        ',
        '1;11; 2014;1883;1956;011;011;0303;1000;SP;SPO ;011 ;11000;F;N;20051126;19980425;        ',
        '1;31;98836;5828;5828;430;430;01  ; 000;MG;    ;    ;00031;M;N;20230331;20230331;20240101'
      ];
      lines.forEach((line, index) => {
        const result = stringParser(propertiesPosition, line);

        assert.deepStrictEqual(result, expectedResult[index]);
      });
    });
  });
});