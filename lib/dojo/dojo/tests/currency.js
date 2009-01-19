if(!dojo._hasResource["tests.currency"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["tests.currency"] = true;
dojo.provide("tests.currency");

dojo.require("dojo.currency");

tests.register("tests.currency", 
	[
		{
			// Test formatting and parsing of currencies in various locales pre-built in dojo.cldr
			// NOTE: we can't set djConfig.extraLocale before bootstrapping unit tests, so directly
			// load resources here for specific locales:

			name: "currency",
			setUp: function(){
				var partLocaleList = ["en-us", "en-ca", "de-de"];
				for(var i = 0 ; i < partLocaleList.length; i ++){
					dojo.requireLocalization("dojo.cldr","currency",partLocaleList[i], "af,be,bg,ar,ca,bn,az,da,de,cs,cy,fa,el,en,es,fi,et,ga,fr,gl,he,hi,hr,hu,ja,is,it,ka,iw,ko,lt,mk,ml,nb,mo,ne,mt,nl,nn,no,pl,pt,ro,sh,ru,sk,sl,te,sq,sr,th,sv,tl,tr,uk,ur,vi,zh,fil,fa-af,en-au,en-ca,en-bz,en-hk,en-ie,en-mt,en-nz,en-sg,en-us,es-ec,es-pr,fr-ca,pa-pk,zh-hk,zh-mo,zh-tw,zh-hant,zh-hant-hk,sr-latn,ROOT,el-polyton,pa-arab");
					dojo.requireLocalization("dojo.cldr","number",partLocaleList[i], "af,be,bg,ar,as,ca,bn,az,da,de,cs,fa,el,en,eo,es,fi,et,eu,ga,fo,fr,ha,gl,he,hi,gu,gv,id,hr,ii,hu,ja,in,hy,is,it,ka,iw,kk,kl,km,kn,ko,kw,lt,mk,lv,ml,nb,mo,ne,mr,ms,mt,nl,nn,no,nr,pa,om,or,pl,ps,pt,ro,sh,si,ru,sk,sl,ta,so,te,sq,sr,ss,th,ti,st,sv,sw,tl,tn,tr,ts,uk,ve,ur,vi,xh,zh,zu,fil,haw,kok,nso,af-na,ar-dz,ar-ma,ar-qa,ar-sa,ar-tn,ar-sy,ar-ye,de-at,de-ch,de-de,de-li,fa-af,el-cy,en-be,en-au,en-bw,en-bz,en-gb,en-ie,en-in,en-jm,en-na,en-mt,en-nz,en-sg,en-tt,en-us,en-za,en-zw,es-cl,es-ec,es-do,es-es,es-gt,es-hn,es-ni,es-mx,es-pa,es-pe,es-pr,es-py,es-sv,es-ve,es-us,es-uy,fr-be,fr-ca,fr-ch,fr-lu,ja-jp,it-ch,ko-kr,ms-bn,nl-be,pt-pt,sw-ke,ur-in,uz-af,zh-cn,zh-hk,zh-tw,zh-hant-hk,en-us-posix,uz-arab,sr-latn-me,ROOT");
				}
			},
			runTest: function(t){
				t.is("\u20ac123.45", dojo.currency.format(123.45, {currency: "EUR", locale: "en-us"}));
				t.is("$123.45", dojo.currency.format(123.45, {currency: "USD", locale: "en-us"}));
				t.is("$1,234.56", dojo.currency.format(1234.56, {currency: "USD", locale: "en-us"}));
				t.is("US$123.45", dojo.currency.format(123.45, {currency: "USD", locale: "en-ca"}));
				t.is("$123.45", dojo.currency.format(123.45, {currency: "CAD", locale: "en-ca"}));
				t.is("CA$123.45", dojo.currency.format(123.45, {currency: "CAD", locale: "en-us"}));
				t.is("123,45 \u20ac", dojo.currency.format(123.45, {currency: "EUR", locale: "de-de"}));
				t.is("1.234,56 \u20ac", dojo.currency.format(1234.56, {currency: "EUR", locale: "de-de"}));
				// There is no special currency symbol for ADP, so expect the ISO code instead
				t.is("ADP123", dojo.currency.format(123, {currency: "ADP", locale: "en-us"}));
				t.is("$1,234", dojo.currency.format(1234, {currency: "USD", fractional: false, locale: "en-us"}));

				t.is(123.45, dojo.currency.parse("$123.45", {currency: "USD", locale: "en-us"}));
				t.is(1234.56, dojo.currency.parse("$1,234.56", {currency: "USD", locale: "en-us"}));
				t.is(123.45, dojo.currency.parse("123,45 \u20ac", {currency: "EUR", locale: "de-de"}));
				t.is(1234.56, dojo.currency.parse("1.234,56 \u20ac", {currency: "EUR", locale: "de-de"}));
				t.is(1234.56, dojo.currency.parse("1.234,56\u20ac", {currency: "EUR", locale: "de-de"}));

				t.is(1234, dojo.currency.parse("$1,234", {currency: "USD", locale: "en-us"}));
				t.is(1234, dojo.currency.parse("$1,234", {currency: "USD", fractional: false, locale: "en-us"}));
				t.t(isNaN(dojo.currency.parse("$1,234", {currency: "USD", fractional: true, locale: "en-us"})));
			}
		}
	]
);

}
