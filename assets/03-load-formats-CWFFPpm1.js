var e={id:`load-formats`,h:{en:`Loading configuration: set, text, XML and JSON`,hi:`Configuration load karna: set, text, XML aur JSON`},body:{en:`
<p>A Junos router can be told the same thing in four languages. <code>cu.load()</code> accepts all four, and the choice is not cosmetic: it decides how easily you can generate the change, how readable the review is, and which of the load actions in chapter 5 you can use.</p>

<h3>What load() does, and does not do</h3>
<p><code>load()</code> parses your text and merges, replaces or overrides the <b>candidate</b>. It does not touch the running configuration. The router checks the syntax while loading, so a typo fails here, with <code>ConfigLoadError</code>. Whether the whole configuration is consistent is checked later, by <code>commit_check()</code> (chapter 6).</p>

<h3>Where the text comes from</h3>
<table class="cmp"><tr><th>Argument</th><th>Meaning</th></tr>
<tr><td>first argument</td><td>A string, or an lxml element for XML.</td></tr>
<tr><td><code>path="chg.conf"</code></td><td>Read the text from a file on the machine running Python. PyEZ guesses the format from the extension (.conf, .set, .xml, .json), but pass <code>format=</code> anyway.</td></tr>
<tr><td><code>template_path=</code>, <code>template=</code>, <code>template_vars=</code></td><td>Render a Jinja2 template with the given variables first (chapter 4).</td></tr>
<tr><td><code>format=</code></td><td><code>"set"</code>, <code>"text"</code>, <code>"xml"</code> or <code>"json"</code>.</td></tr>
<tr><td><code>merge=</code>, <code>overwrite=</code>, <code>update=</code></td><td>The load action for text, XML and JSON (chapter 5).</td></tr>
<tr><td><code>ignore_warning=</code></td><td>Do not raise for warnings, only for errors.</td></tr></table>
<p>If you omit <code>format</code> for a string, PyEZ looks at the text and guesses. Guessing is how a set command pasted into a text load produces a confusing error, so always pass it.</p>

<h3>The same change in four formats</h3>
<p>One change, location building B1, loaded in each format in turn, with the candidate cleared in between:</p>
<pre class="code"><span class="c"># formats.py - the same change in set, text, XML and JSON: the diff is identical</span>
from jnpr.junos.utils.config import Config

from nkjunos import connect

CHANGE = {
    "set": "set system location building B1",
    "text": "system {\\n    location {\\n        building B1;\\n    }\\n}\\n",
    "xml": "&lt;configuration&gt;&lt;system&gt;&lt;location&gt;&lt;building&gt;B1&lt;/building&gt;&lt;/location&gt;&lt;/system&gt;&lt;/configuration&gt;",
    "json": '{"configuration": {"system": {"location": {"building": "B1"}}}}',
}

dev = connect("J1")
cu = Config(dev)
cu.lock()
for fmt in ("set", "text", "xml", "json"):
    cu.load(CHANGE[fmt], format=fmt)
    print("%-4s ->" % fmt, cu.diff().strip().replace("\\n", " | "))
    cu.rollback()
cu.unlock()
dev.close()</pre>
<pre class="out">AUTO01$ python3 formats.py
set  -&gt; [edit system] | +   location { | +       building B1; | +   }
text -&gt; [edit system] | +   location { | +       building B1; | +   }
xml  -&gt; [edit system] | +   location { | +       building B1; | +   }
json -&gt; [edit system] | +   location { | +       building B1; | +   }</pre>
<p>The four diffs are identical, because the diff is computed by the router from the candidate, not from your text. That is a useful habit: when you are not sure how a change is written in one format, load it in the format you know and compare the diff.</p>

<h3>Learning the syntax from the router</h3>
<p>You never have to guess how a statement is written in text, set or JSON. Ask the router to print the part you care about in that format with <code>get_config</code> and the <code>format</code> option:</p>
<pre class="code"><span class="c"># getfmt.py - read the configuration in the format you want to write</span>
from nkjunos import connect

dev = connect("J1")
rsp = dev.rpc.get_config(filter_xml="system/host-name", options={"format": "text"})
print(rsp.tag, "|", rsp.findtext("configuration-output").strip())
rsp = dev.rpc.get_config(filter_xml="system/host-name", options={"format": "set"})
print(rsp.tag, "|", rsp.text.strip())
rsp = dev.rpc.get_config(filter_xml="system/host-name", options={"format": "json"})
print(rsp.tag, "|", " ".join(rsp.text.split())[:90])
rsp = dev.rpc.get_config(filter_xml="system/host-name")
print(rsp.tag, "|", [c.tag for c in rsp], rsp.findtext(".//host-name"))
dev.close()</pre>
<pre class="out">AUTO01$ python3 getfmt.py
<span class="hl">configuration-information</span> | system {
    host-name J1;
}
<span class="hl">configuration-set</span> | set system host-name J1
<span class="hl">configuration-json</span> | { "configuration" : { "@" : { "junos:commit-seconds" : "1791720023", "junos:commit-localti
<span class="hl">configuration</span> | ['system'] J1</pre>
<p>Look at the first column of the output: the container element differs for each format. Text comes back inside <code>configuration-output</code> in a <code>configuration-information</code> element; set comes back as the text of <code>configuration-set</code>; JSON as the text of <code>configuration-json</code>, with a metadata object under the key "@"; the default is real XML under <code>configuration</code>. JSON load needs a reasonably modern Junos release.</p>

<h3>Which format should you choose?</h3>
<table class="cmp"><tr><th>Format</th><th>Best for</th><th>Watch out</th></tr>
<tr><td>set</td><td>Generated changes. One statement per line, easy to template, easy to review, easy to delete (<code>delete ...</code>).</td><td>Only additive unless you add delete lines.</td></tr>
<tr><td>text</td><td>Files people read, <code>replace:</code> tags, and full-configuration override.</td><td>Braces and indentation must be balanced.</td></tr>
<tr><td>XML</td><td>Changes built by code with lxml, per-element operations (replace, delete attributes).</td><td>Verbose; must be rooted at <code>&lt;configuration&gt;</code>.</td></tr>
<tr><td>JSON</td><td>Pipelines that already hold data as JSON.</td><td>Root key <code>configuration</code>; release support.</td></tr></table>

<div class="warn"><p><b>Common mistake.</b> Assuming a successful <code>load()</code> means the change is valid. It means the syntax is valid. A policy that refers to a missing term, or an interface that does not exist, passes the load and fails at <code>commit_check()</code>.</p></div>

<div class="exam"><p><b>Exam trap.</b> After <code>load()</code> the router is unchanged. If the script ends here, the candidate still holds your lines, and the next lock fails with "configuration database modified".</p></div>

<div class="scn"><h4>The JSON that was really text</h4><p>An engineer saved the output of <code>show configuration | display json</code> to a file and later loaded it with <code>format="text"</code>. The load failed with a syntax error at the first brace. Loading the same file with <code>format="json"</code> worked at once. A one-line wrapper that picks the format from the file extension, and refuses unknown extensions, ended the confusion.</p><p><b>Lesson:</b> the format is part of the data. Store it next to the data, and pass it explicitly.</p></div>

<div class="iv"><p class="q">"Which Config.load format do you prefer for automation, and why?"</p><p>Set for generated changes: one statement per line, trivial to render from Jinja2, easy to review in a diff, and deletions are explicit. Text when I need replace tags or a whole-file override. XML when the change is built as a data structure. I always pass <code>format=</code>, and I judge a change by <code>diff()</code>, not by how I wrote it.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>load()</code> changes the candidate only; syntax errors raise <code>ConfigLoadError</code> immediately.</li>
<li>Four formats: set, text, XML, JSON. Pass <code>format=</code> every time.</li>
<li>The router computes the diff, so every format gives the same diff for the same change.</li>
<li>Use <code>get_config(options={"format": ...})</code> to see how the router writes a statement.</li>
<li>A valid load is not a valid configuration; <code>commit_check()</code> decides that.</li></ul></div>
`,hi:`
<p>Junos router ko wahi baat chaar bhashaon mein bataayi ja sakti hai. <code>cu.load()</code> chaaron ko leta hai, aur chunav sirf dikhawati nahi hai: yeh tay karta hai ki change generate karna kitna aasaan hai, review kitna padhne layak hai, aur chapter 5 ke kaun se load actions aap use kar sakte ho.</p>

<h3>load() kya karta hai, aur kya nahi</h3>
<p><code>load()</code> aapka text parse karta hai aur <b>candidate</b> ko merge, replace ya override karta hai. Yeh running configuration ko nahi chhoota. Router load karte waqt syntax check karta hai, isliye typo yahin <code>ConfigLoadError</code> ke saath fail hota hai. Poori configuration consistent hai ya nahi, yeh baad mein <code>commit_check()</code> check karta hai (chapter 6).</p>

<h3>Text kahan se aata hai</h3>
<table class="cmp"><tr><th>Argument</th><th>Matlab</th></tr>
<tr><td>pehla argument</td><td>Ek string, ya XML ke liye lxml element.</td></tr>
<tr><td><code>path="chg.conf"</code></td><td>Python chalane wali machine ki file se text padho. PyEZ extension (.conf, .set, .xml, .json) se format guess karta hai, phir bhi <code>format=</code> do.</td></tr>
<tr><td><code>template_path=</code>, <code>template=</code>, <code>template_vars=</code></td><td>Pehle diye gaye variables ke saath Jinja2 template render karo (chapter 4).</td></tr>
<tr><td><code>format=</code></td><td><code>"set"</code>, <code>"text"</code>, <code>"xml"</code> ya <code>"json"</code>.</td></tr>
<tr><td><code>merge=</code>, <code>overwrite=</code>, <code>update=</code></td><td>Text, XML aur JSON ke liye load action (chapter 5).</td></tr>
<tr><td><code>ignore_warning=</code></td><td>Warnings par raise mat karo, sirf errors par.</td></tr></table>
<p>Agar string ke liye <code>format</code> chhod do, to PyEZ text dekhkar guess karta hai. Guess karne se hi text load mein paste hui set command ek confusing error deti hai, isliye hamesha format do.</p>

<h3>Ek change, chaar formats</h3>
<p>Ek change, location building B1, har format mein baari baari load kiya gaya, beech mein candidate saaf karke:</p>
<pre class="code"><span class="c"># formats.py - the same change in set, text, XML and JSON: the diff is identical</span>
from jnpr.junos.utils.config import Config

from nkjunos import connect

CHANGE = {
    "set": "set system location building B1",
    "text": "system {\\n    location {\\n        building B1;\\n    }\\n}\\n",
    "xml": "&lt;configuration&gt;&lt;system&gt;&lt;location&gt;&lt;building&gt;B1&lt;/building&gt;&lt;/location&gt;&lt;/system&gt;&lt;/configuration&gt;",
    "json": '{"configuration": {"system": {"location": {"building": "B1"}}}}',
}

dev = connect("J1")
cu = Config(dev)
cu.lock()
for fmt in ("set", "text", "xml", "json"):
    cu.load(CHANGE[fmt], format=fmt)
    print("%-4s ->" % fmt, cu.diff().strip().replace("\\n", " | "))
    cu.rollback()
cu.unlock()
dev.close()</pre>
<pre class="out">AUTO01$ python3 formats.py
set  -&gt; [edit system] | +   location { | +       building B1; | +   }
text -&gt; [edit system] | +   location { | +       building B1; | +   }
xml  -&gt; [edit system] | +   location { | +       building B1; | +   }
json -&gt; [edit system] | +   location { | +       building B1; | +   }</pre>
<p>Chaaron diffs ek jaise hain, kyunki diff router candidate se banata hai, aapke text se nahi. Yeh kaam ki aadat hai: jab aapko pakka na ho ki change ek format mein kaise likhte hain, to use us format mein load karo jo aap jaante ho aur diff compare karo.</p>

<h3>Router se syntax seekhna</h3>
<p>Aapko text, set ya JSON mein statement ka syntax guess nahi karna padta. Router se kaho ki jo hissa chahiye use us format mein print kare, <code>get_config</code> aur <code>format</code> option se:</p>
<pre class="code"><span class="c"># getfmt.py - read the configuration in the format you want to write</span>
from nkjunos import connect

dev = connect("J1")
rsp = dev.rpc.get_config(filter_xml="system/host-name", options={"format": "text"})
print(rsp.tag, "|", rsp.findtext("configuration-output").strip())
rsp = dev.rpc.get_config(filter_xml="system/host-name", options={"format": "set"})
print(rsp.tag, "|", rsp.text.strip())
rsp = dev.rpc.get_config(filter_xml="system/host-name", options={"format": "json"})
print(rsp.tag, "|", " ".join(rsp.text.split())[:90])
rsp = dev.rpc.get_config(filter_xml="system/host-name")
print(rsp.tag, "|", [c.tag for c in rsp], rsp.findtext(".//host-name"))
dev.close()</pre>
<pre class="out">AUTO01$ python3 getfmt.py
<span class="hl">configuration-information</span> | system {
    host-name J1;
}
<span class="hl">configuration-set</span> | set system host-name J1
<span class="hl">configuration-json</span> | { "configuration" : { "@" : { "junos:commit-seconds" : "1791720023", "junos:commit-localti
<span class="hl">configuration</span> | ['system'] J1</pre>
<p>Output ke pehle column ko dekho: har format ka container element alag hai. Text <code>configuration-information</code> element ke andar <code>configuration-output</code> mein aata hai; set <code>configuration-set</code> ke text ke roop mein; JSON <code>configuration-json</code> ke text ke roop mein, "@" key ke neeche metadata object ke saath; default asli XML hai <code>configuration</code> ke neeche. JSON load ke liye kaafi naya Junos release chahiye.</p>

<h3>Kaun sa format chunein?</h3>
<table class="cmp"><tr><th>Format</th><th>Kis ke liye best</th><th>Dhyan rakho</th></tr>
<tr><td>set</td><td>Generated changes. Ek line mein ek statement, template banana aasaan, diff mein review aasaan, deletion saaf (<code>delete ...</code>).</td><td>Sirf additive hai jab tak delete lines na jodo.</td></tr>
<tr><td>text</td><td>Logon ke padhne wali files, <code>replace:</code> tags, aur poori configuration override.</td><td>Braces aur indentation balanced hone chahiye.</td></tr>
<tr><td>XML</td><td>Code se lxml mein bane changes, per-element operations (replace, delete attributes).</td><td>Lamba hai; <code>&lt;configuration&gt;</code> se shuru hona chahiye.</td></tr>
<tr><td>JSON</td><td>Pipelines jo data pehle se JSON mein rakhte hain.</td><td>Root key <code>configuration</code>; release support.</td></tr></table>

<div class="warn"><p><b>Aam galti.</b> Maan lena ki safal <code>load()</code> ka matlab change valid hai. Matlab syntax valid hai. Missing term ko refer karne wali policy, ya jo interface exist nahi karta, load pass kar jaate hain aur <code>commit_check()</code> par fail hote hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>load()</code> ke baad router badla nahi hota. Agar script yahin khatam ho jaaye, to candidate mein aapki lines rehti hain, aur agla lock "configuration database modified" ke saath fail hota hai.</p></div>

<div class="scn"><h4>Woh JSON jo asal mein text tha</h4><p>Ek engineer ne <code>show configuration | display json</code> ka output file mein save kiya aur baad mein use <code>format="text"</code> se load kiya. Load pehle brace par syntax error ke saath fail hua. Wahi file <code>format="json"</code> se turant load ho gayi. File extension se format chunne wala aur anjaan extension ko mana karne wala ek-line wrapper ne confusion khatam kar diya.</p><p><b>Lesson:</b> format data ka hissa hai. Use data ke saath rakho, aur explicitly pass karo.</p></div>

<div class="iv"><p class="q">"Automation ke liye kaun sa Config.load format pasand karte ho, aur kyun?"</p><p>Generated changes ke liye set: ek line mein ek statement, Jinja2 se render karna aasaan, diff mein review aasaan, aur deletion saaf. Jab replace tags ya poori-file override chahiye to text. Jab change data structure ki tarah bana ho to XML. Main hamesha <code>format=</code> deta hoon, aur change ko <code>diff()</code> se judge karta hoon, is se nahi ki maine use kaise likha.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>load()</code> sirf candidate badalta hai; syntax errors turant <code>ConfigLoadError</code> raise karte hain.</li>
<li>Chaar formats: set, text, XML, JSON. Har baar <code>format=</code> do.</li>
<li>Diff router banata hai, isliye ek hi change ke liye har format wahi diff deta hai.</li>
<li>Router statement kaise likhta hai dekhne ke liye <code>get_config(options={"format": ...})</code> use karo.</li>
<li>Valid load ka matlab valid configuration nahi; woh <code>commit_check()</code> tay karta hai.</li></ul></div>
`}};export{e as default};