var e={id:`templates`,h:{en:`Templates: Jinja2 for Junos`,hi:`Templates: Junos ke liye Jinja2`},body:{en:`
<p>You will rarely type a change by hand into a script. The same change goes to many routers with small differences: an address here, a description there. If you write one block of commands per router, you review ten blocks and miss the typo in the seventh. If you write one <b>template</b> and one file of <b>data</b>, you review the template once and the data as a short list. That is the idea from py-templates, and it fits Junos especially well, because set commands are one statement per line.</p>

<h3>Data on one side, shape on the other</h3>
<p>Here is the data for ticket NK-2001: a customer-facing uplink on ge-0/0/3 of J1 and J2. It says <i>what</i> we want. There is not a single command in it.</p>
<pre class="code"><span class="c"># intent.yml - the DATA: what we want, no commands in sight</span>
J1:
  interfaces:
    - {name: ge-0/0/3, description: CUST-ACME-UPLINK, address: 10.44.1.1/30, ospf_passive: true}
J2:
  interfaces:
    - {name: ge-0/0/3, description: CUST-ACME-BACKUP, address: 10.44.2.1/30, ospf_passive: true}</pre>
<p>And here is the template. It says <i>how</i> a Junos router wants to hear it. A <code>for</code> loop handles any number of interfaces, and an <code>if</code> adds the passive OSPF line only when the data asks for it.</p>
<pre class="code"><span class="c"># uplink.j2 - the SHAPE: one set statement per line</span>
{% for ifc in interfaces %}
set interfaces {{ ifc.name }} description "{{ ifc.description }}"
set interfaces {{ ifc.name }} unit 0 family inet address {{ ifc.address }}
{% if ifc.ospf_passive %}
set protocols ospf area 0.0.0.0 interface {{ ifc.name }}.0 passive
{% endif %}
{% endfor %}</pre>
<h3>Rendering it with your own Environment</h3>
<p>The small module <code>render.py</code> loads the data for one device and renders the template. Two options matter. <code>trim_blocks</code> and <code>lstrip_blocks</code> remove the blank lines that the <code>{% ... %}</code> tags would leave behind, and <code>keep_trailing_newline</code> keeps the final line ending.</p>
<pre class="code"><span class="c"># render.py - turn the intent for one device into Junos set commands</span>
import sys

import yaml
from jinja2 import Environment, FileSystemLoader

env = Environment(loader=FileSystemLoader("."), trim_blocks=True, lstrip_blocks=True, keep_trailing_newline=True)


def render(device):
    intent = yaml.safe_load(open("intent.yml"))
    return env.get_template("uplink.j2").render(device=device, **intent[device])


if __name__ == "__main__":
    print(render(sys.argv[1]), end="")</pre>
<pre class="out">AUTO01$ python3 render.py J1
set interfaces ge-0/0/3 description "CUST-ACME-UPLINK"
set interfaces ge-0/0/3 unit 0 family inet address 10.44.1.1/30
set protocols ospf area 0.0.0.0 interface ge-0/0/3.0 passive</pre>
<p>Three lines, ready to be loaded with <code>format="set"</code>. Because <code>render()</code> returns a plain string, you can print it, test it with pytest (py-pytest) and diff it between two versions of the data, all without a router. That is the main reason to render yourself.</p>

<h3>Letting PyEZ render it</h3>
<p><code>Config.load()</code> can also do the rendering: give it <code>template_path</code> (a file) or <code>template</code> (a Jinja2 <code>Template</code> object) and <code>template_vars</code> (a dictionary). The result is the same candidate, the same diff:</p>
<pre class="code"><span class="c"># tplload.py - let PyEZ render the Jinja2 template itself</span>
import yaml

from jnpr.junos.utils.config import Config

from nkjunos import connect

intent = yaml.safe_load(open("intent.yml"))
dev = connect("J1")
cu = Config(dev)
cu.lock()
cu.load(template_path="uplink.j2", template_vars=intent["J1"], format="set")
print(cu.diff())
cu.rollback()
cu.unlock()
dev.close()</pre>
<pre class="out">AUTO01$ python3 tplload.py

[edit interfaces]
+   ge-0/0/3 {
+       description CUST-ACME-UPLINK;
+       unit 0 {
+           family inet {
+               address 10.44.1.1/30;
+           }
+       }
+   }
[edit protocols ospf area 0.0.0.0]
+   interface ge-0/0/3.0 {
+       passive;
+   }</pre>
<p>This is convenient for a short script. For a tool you keep, we prefer our own <code>Environment</code>, because it lets us choose the options, share one environment between many templates, and, as the next section shows, make mistakes loud.</p>

<h3>The silent failure: a variable that is not there</h3>
<p>By default Jinja2 renders a missing variable as an empty string. In a Junos set command, that produces a line with a hole in it. Watch what happens when the data forgets the key <code>desc</code>:</p>
<pre class="code"><span class="c"># undef.py - a missing variable renders as nothing, unless you ask Jinja2 to be strict</span>
from jinja2 import Environment, StrictUndefined, Template
from jnpr.junos.exception import ConfigLoadError
from jnpr.junos.utils.config import Config

from nkjunos import connect

dev = connect("J1")
text = Template("set interfaces {{ ifc.name }} description {{ ifc.desc }}").render(ifc={"name": "ge-0/0/3"})
print("rendered:", repr(text))
cu = Config(dev)
cu.lock()
try:
    cu.load(text, format="set")
except ConfigLoadError as err:
    print("ConfigLoadError:", err)
cu.rollback()
cu.unlock()
try:
    Environment(undefined=StrictUndefined).from_string("set interfaces {{ ifc.name }} description {{ ifc.desc }}").render(ifc={"name": "ge-0/0/3"})
except Exception as err:
    print(type(err).__name__ + ":", err)
dev.close()</pre>
<pre class="out">AUTO01$ python3 undef.py
rendered: 'set interfaces ge-0/0/3 description '
ConfigLoadError: ConfigLoadError(severity: error, bad_element: description, <span class="hl">message: missing argument</span>)
<span class="hl">UndefinedError</span>: 'dict object' has no attribute 'desc'</pre>
<p>The router did catch it, with "missing argument", but only after the script had connected and locked. Worse, if the missing value is at the end of a line that is still valid, the router would accept it. <code>StrictUndefined</code> stops the problem at the source: the template raises <code>UndefinedError</code> before any connection is opened. Use it in every template environment that feeds a device.</p>

<div class="warn"><p><b>Common mistakes.</b> Putting a description with spaces in a set command without quotes; letting <code>{% if %}</code> lines leave blank lines you did not notice; building the command by string concatenation instead of a template; and trusting the data file without validating it (adv-verify checks intent files with JSON Schema).</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>template_vars</code> is a dictionary of variables for <i>one</i> render. It is not a per-device inventory. Looping over devices is your job, one <code>load()</code> per device.</p></div>

<div class="scn"><h4>The empty description</h4><p>A spreadsheet export had an empty "desc" column for one customer. The template rendered <code>description </code> with nothing after it, and the push stopped on that router with "missing argument" in the middle of a fleet run. The other routers had already changed. After the team switched to <code>StrictUndefined</code> and a schema check on the data file, the same mistake stopped the run at render time, before any router was touched.</p><p><b>Lesson:</b> make bad data fail early, on the laptop, not late, on the router.</p></div>

<div class="iv"><p class="q">"Why do you render the configuration yourself instead of passing the template to PyEZ?"</p><p>Both work. Rendering myself gives me a plain string I can print, unit-test and diff without a device, it lets me use one Environment with StrictUndefined and trim options, and it lets me fail before connecting. The PyEZ template arguments are fine for a quick script.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Keep data (YAML) and shape (Jinja2) apart; review each once.</li>
<li>Set format is the easiest target: one statement per line.</li>
<li><code>cu.load(template_path=..., template_vars=..., format="set")</code> renders inside PyEZ.</li>
<li>Render yourself for testing; use <code>StrictUndefined</code> so a missing variable raises instead of rendering empty.</li>
<li>One render and one <code>load()</code> per device.</li></ul></div>
`,hi:`
<p>Aap script mein change shayad hi haath se type karte ho. Wahi change kai routers par thode farq ke saath jaata hai: yahan ek address, wahan ek description. Agar aap har router ke liye commands ka alag block likhoge, to das blocks review karoge aur saatwein ka typo chhoot jaayega. Agar aap ek <b>template</b> aur ek <b>data</b> file likhoge, to template ko ek baar aur data ko chhoti list ki tarah review karoge. Yeh py-templates ka idea hai, aur Junos par khaas taur par fit hota hai, kyunki set commands mein ek line ek statement hoti hai.</p>

<h3>Ek taraf data, doosri taraf shape</h3>
<p>Yeh ticket NK-2001 ka data hai: J1 aur J2 ke ge-0/0/3 par customer-facing uplink. Yeh batata hai <i>kya</i> chahiye. Isme ek bhi command nahi hai.</p>
<pre class="code"><span class="c"># intent.yml - the DATA: what we want, no commands in sight</span>
J1:
  interfaces:
    - {name: ge-0/0/3, description: CUST-ACME-UPLINK, address: 10.44.1.1/30, ospf_passive: true}
J2:
  interfaces:
    - {name: ge-0/0/3, description: CUST-ACME-BACKUP, address: 10.44.2.1/30, ospf_passive: true}</pre>
<p>Aur yeh template hai. Yeh batata hai Junos router ko baat <i>kaise</i> sunni pasand hai. <code>for</code> loop kitne bhi interfaces sambhal leta hai, aur <code>if</code> passive OSPF line tabhi jodta hai jab data maange.</p>
<pre class="code"><span class="c"># uplink.j2 - the SHAPE: one set statement per line</span>
{% for ifc in interfaces %}
set interfaces {{ ifc.name }} description "{{ ifc.description }}"
set interfaces {{ ifc.name }} unit 0 family inet address {{ ifc.address }}
{% if ifc.ospf_passive %}
set protocols ospf area 0.0.0.0 interface {{ ifc.name }}.0 passive
{% endif %}
{% endfor %}</pre>
<h3>Apne Environment se render karna</h3>
<p>Chhota module <code>render.py</code> ek device ka data load karta hai aur template render karta hai. Do options zaroori hain. <code>trim_blocks</code> aur <code>lstrip_blocks</code> woh khaali lines hata dete hain jo <code>{% ... %}</code> tags chhod dete, aur <code>keep_trailing_newline</code> aakhri line ending rakhta hai.</p>
<pre class="code"><span class="c"># render.py - turn the intent for one device into Junos set commands</span>
import sys

import yaml
from jinja2 import Environment, FileSystemLoader

env = Environment(loader=FileSystemLoader("."), trim_blocks=True, lstrip_blocks=True, keep_trailing_newline=True)


def render(device):
    intent = yaml.safe_load(open("intent.yml"))
    return env.get_template("uplink.j2").render(device=device, **intent[device])


if __name__ == "__main__":
    print(render(sys.argv[1]), end="")</pre>
<pre class="out">AUTO01$ python3 render.py J1
set interfaces ge-0/0/3 description "CUST-ACME-UPLINK"
set interfaces ge-0/0/3 unit 0 family inet address 10.44.1.1/30
set protocols ospf area 0.0.0.0 interface ge-0/0/3.0 passive</pre>
<p>Teen lines, <code>format="set"</code> ke saath load hone ko taiyaar. Kyunki <code>render()</code> plain string lautata hai, aap use print kar sakte ho, pytest (py-pytest) se test kar sakte ho aur data ke do versions ke beech diff kar sakte ho, bina router ke. Khud render karne ki yahi mukhya wajah hai.</p>

<h3>PyEZ se render karwana</h3>
<p><code>Config.load()</code> rendering bhi kar sakta hai: use <code>template_path</code> (file) ya <code>template</code> (Jinja2 <code>Template</code> object) aur <code>template_vars</code> (dictionary) do. Result wahi candidate, wahi diff:</p>
<pre class="code"><span class="c"># tplload.py - let PyEZ render the Jinja2 template itself</span>
import yaml

from jnpr.junos.utils.config import Config

from nkjunos import connect

intent = yaml.safe_load(open("intent.yml"))
dev = connect("J1")
cu = Config(dev)
cu.lock()
cu.load(template_path="uplink.j2", template_vars=intent["J1"], format="set")
print(cu.diff())
cu.rollback()
cu.unlock()
dev.close()</pre>
<pre class="out">AUTO01$ python3 tplload.py

[edit interfaces]
+   ge-0/0/3 {
+       description CUST-ACME-UPLINK;
+       unit 0 {
+           family inet {
+               address 10.44.1.1/30;
+           }
+       }
+   }
[edit protocols ospf area 0.0.0.0]
+   interface ge-0/0/3.0 {
+       passive;
+   }</pre>
<p>Chhoti script ke liye yeh suvidhajanak hai. Jo tool aap rakhoge uske liye hum apna <code>Environment</code> pasand karte hain, kyunki us se options hum chunte hain, ek environment kai templates mein share hota hai, aur, jaisa agla section dikhata hai, galtiyan shor machati hain.</p>

<h3>Chupchaap failure: jo variable hai hi nahi</h3>
<p>Default mein Jinja2 missing variable ko khaali string render karta hai. Junos set command mein isse ek line banti hai jisme ched hota hai. Dekho kya hota hai jab data mein key <code>desc</code> bhool jaaye:</p>
<pre class="code"><span class="c"># undef.py - a missing variable renders as nothing, unless you ask Jinja2 to be strict</span>
from jinja2 import Environment, StrictUndefined, Template
from jnpr.junos.exception import ConfigLoadError
from jnpr.junos.utils.config import Config

from nkjunos import connect

dev = connect("J1")
text = Template("set interfaces {{ ifc.name }} description {{ ifc.desc }}").render(ifc={"name": "ge-0/0/3"})
print("rendered:", repr(text))
cu = Config(dev)
cu.lock()
try:
    cu.load(text, format="set")
except ConfigLoadError as err:
    print("ConfigLoadError:", err)
cu.rollback()
cu.unlock()
try:
    Environment(undefined=StrictUndefined).from_string("set interfaces {{ ifc.name }} description {{ ifc.desc }}").render(ifc={"name": "ge-0/0/3"})
except Exception as err:
    print(type(err).__name__ + ":", err)
dev.close()</pre>
<pre class="out">AUTO01$ python3 undef.py
rendered: 'set interfaces ge-0/0/3 description '
ConfigLoadError: ConfigLoadError(severity: error, bad_element: description, <span class="hl">message: missing argument</span>)
<span class="hl">UndefinedError</span>: 'dict object' has no attribute 'desc'</pre>
<p>Router ne ise pakda, "missing argument" ke saath, par tab jab script connect aur lock kar chuki thi. Aur bura yeh ki agar missing value aisi line ke end mein ho jo phir bhi valid hai, to router use accept kar leta. <code>StrictUndefined</code> samasya ko source par rokta hai: template koi bhi connection kholne se pehle <code>UndefinedError</code> raise karta hai. Har us template environment mein use karo jo device ko feed karta hai.</p>

<div class="warn"><p><b>Aam galtiyan.</b> Set command mein spaces wali description ko bina quotes ke likhna; <code>{% if %}</code> lines se aisi khaali lines reh jaana jo dikhi nahi; template ki jagah string concatenation se command banana; aur data file ko bina validate kiye bharosa karna (adv-verify intent files ko JSON Schema se check karta hai).</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>template_vars</code> <i>ek</i> render ke variables ki dictionary hai. Yeh per-device inventory nahi hai. Devices par loop karna aapka kaam hai, har device ke liye ek <code>load()</code>.</p></div>

<div class="scn"><h4>Khaali description</h4><p>Ek spreadsheet export mein ek customer ka "desc" column khaali tha. Template ne <code>description </code> render kiya, uske baad kuch nahi, aur fleet run ke beech ek router par push "missing argument" ke saath ruk gaya. Baaki routers pehle hi badal chuke the. Jab team ne <code>StrictUndefined</code> aur data file par schema check apnaya, to wahi galti render time par hi run rok deti, kisi router ko chhoone se pehle.</p><p><b>Lesson:</b> kharab data ko jaldi fail karao, laptop par, router par der se nahi.</p></div>

<div class="iv"><p class="q">"Template PyEZ ko dene ki jagah configuration khud render kyun karte ho?"</p><p>Dono kaam karte hain. Khud render karne se mujhe plain string milti hai jise main bina device ke print, unit-test aur diff kar sakta hoon, main ek Environment StrictUndefined aur trim options ke saath use kar sakta hoon, aur connect karne se pehle fail kar sakta hoon. PyEZ ke template arguments quick script ke liye theek hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Data (YAML) aur shape (Jinja2) alag rakho; har ek ko ek baar review karo.</li>
<li>Set format sabse aasaan target hai: ek line, ek statement.</li>
<li><code>cu.load(template_path=..., template_vars=..., format="set")</code> PyEZ ke andar render karta hai.</li>
<li>Testing ke liye khud render karo; <code>StrictUndefined</code> use karo taaki missing variable khaali render hone ki jagah raise kare.</li>
<li>Har device ke liye ek render aur ek <code>load()</code>.</li></ul></div>
`}};export{e as default};