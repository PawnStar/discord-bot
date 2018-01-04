var ifvms = require('ifvms');
var vm = new ifvms.ZVM();
var GlkOte = require('glkote-term');
var Glk = GlkOte.Glk;
var fs = require('fs');
var path = require('path');

var options = {
	vm: vm,
	Dialog: new GlkOte.Dialog(),
	Glk: Glk,
  GlkOte: new GlkOte.DumbGlkOte()
}

var galatea = fs.readFileSync(path.join(__dirname, './Galatea.zblorb'));

vm.prepare( galatea, options);

Glk.init(options)
