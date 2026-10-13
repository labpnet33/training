var e={id:`candidate-workflow`,h:{en:`The candidate workflow: load, compare, commit or discard`,hi:`Candidate workflow: load, compare, commit ya discard`},body:{en:`<p>Writing is where scripts hurt networks, so NAPALM forces a habit on you: you never send a change straight to a device. You <b>load</b> a candidate, ask the device what would be different, read that answer, and only then <b>commit</b> or <b>discard</b>. Program 1's <code>py-safepush</code> and the candidate datastores of <code>adv-netconf</code> and <code>adv-pyez-config</code> taught the same idea; NAPALM gives it one set of method names.</p>

<h3>An analogy: track changes</h3>
<p>You edit a contract with track changes on. The document shows every insertion and deletion in colour, and nothing is final until you accept. <code>compare_config()</code> is the coloured view; <code>commit_config()</code> is "accept all"; <code>discard_config()</code> is "reject all".</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Candidate workflow">
<rect x="10" y="20" width="110" height="50" rx="8" fill="#bae6fd"/><text x="65" y="42" text-anchor="middle" class="svg-ink" font-size="13">load_merge_candidate</text><text x="65" y="58" text-anchor="middle" class="svg-muted" font-size="10">config= or filename=</text>
<rect x="150" y="20" width="110" height="50" rx="8" fill="#fde68a"/><text x="205" y="42" text-anchor="middle" class="svg-ink" font-size="13">compare_config</text><text x="205" y="58" text-anchor="middle" class="svg-muted" font-size="10">read the diff</text>
<rect x="290" y="20" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="345" y="42" text-anchor="middle" class="svg-ink" font-size="13">commit_config</text><text x="345" y="58" text-anchor="middle" class="svg-muted" font-size="10">the change goes live</text>
<rect x="430" y="20" width="110" height="50" rx="8" fill="#e2e8f0"/><text x="485" y="42" text-anchor="middle" class="svg-ink" font-size="13">get_* getters</text><text x="485" y="58" text-anchor="middle" class="svg-muted" font-size="10">verify the result</text>
<line x1="120" y1="45" x2="150" y2="45" stroke="#64748b" stroke-width="2"/><line x1="260" y1="45" x2="290" y2="45" stroke="#64748b" stroke-width="2"/><line x1="400" y1="45" x2="430" y2="45" stroke="#64748b" stroke-width="2"/>
<rect x="150" y="95" width="250" height="40" rx="8" fill="#fecaca"/><text x="275" y="120" text-anchor="middle" class="svg-ink" font-size="13">discard_config: empty diff, error or --dry-run</text>
<line x1="205" y1="70" x2="205" y2="95" stroke="#dc2626" stroke-width="2"/>
<text x="565" y="45" text-anchor="middle" class="svg-muted" font-size="12">never skip</text><text x="565" y="62" text-anchor="middle" class="svg-muted" font-size="12">the middle two</text>
</svg><p class="cap">Load, look, then commit or discard. A change that was not compared was not reviewed.</p></div>

<h3>The calls</h3>
<table class="cmp"><tr><th>Call</th><th>What it does</th></tr>
<tr><td><code>load_merge_candidate(filename=None, config=None)</code></td><td>Stage lines to be <b>added</b> to the running configuration. Give text (<code>config=</code>) or a file name.</td></tr>
<tr><td><code>compare_config()</code></td><td>Returns the difference as text. An empty string means the candidate changes nothing.</td></tr>
<tr><td><code>commit_config(message="", revert_in=None)</code></td><td>Makes the candidate the running configuration.</td></tr>
<tr><td><code>discard_config()</code></td><td>Throws the candidate away. The device is untouched.</td></tr></table>

<h3>What the drivers do underneath</h3>
<table class="cmp"><tr><th>Driver</th><th>Candidate lives in</th><th>The diff looks like</th></tr>
<tr><td><code>ios</code></td><td>The driver's memory in the lab (a file on flash on real gear)</td><td>Lines that change, each prefixed <code>+</code> or <code>-</code>, with their parent lines unprefixed</td></tr>
<tr><td><code>eos</code></td><td>A configuration session on the switch</td><td>A unified diff with <code>@@</code> markers (the session's own diff)</td></tr>
<tr><td><code>junos</code></td><td>The Junos candidate database</td><td><code>[edit ...]</code> headings with <code>+</code> and <code>-</code> lines</td></tr></table>
<p>Every platform answers the same question in its own dialect. You do not translate the diff; a human or a log reads it.</p>

<h3>One candidate text per platform</h3>
<p>You still write each vendor's syntax. Keep that inside one small function so the rest of the tool stays vendor-neutral. This is the first half of <code>ntpsync.py</code> from Lab 1.</p>
<pre class="code">"""ntpsync.py - merge the NTP servers we want into any NAPALM device; always show the diff first"""
import sys

from napalm.base.exceptions import MergeConfigException
from nkdev import DEVICES, open_device

WANT = ["10.99.0.60", "10.99.0.61"]


def candidate(driver, servers):
    """One candidate text per platform: IOS and EOS take CLI lines, Junos takes set lines."""
    if driver == "junos":
        return "".join("set system ntp server %s\\n" % s for s in servers)
    return "".join("ntp server %s\\n" % s for s in servers)


def preview(name, servers):
    """Load the candidate, print the diff, throw the candidate away. Nothing changes on the device."""
    dev = open_device(name)
    try:
        dev.load_merge_candidate(config=candidate(DEVICES[name]["driver"], servers))
        diff = dev.compare_config()
        print("%s: diff" % name)
        print(diff if diff.strip() else "(no difference)")
    finally:
        dev.discard_config()
        dev.close()</pre>
<p><code>preview()</code> always discards in <code>finally</code>, even if the diff call fails. A forgotten candidate is not harmless: on Junos it sits in the device's candidate database for the next person who commits, and on EOS it leaves a configuration session open on the switch. Make "discard" the default exit.</p>
<pre class="code">from ntpsync import WANT, preview

for name in ("R1", "J1"):
    preview(name, WANT)</pre>
<pre class="out">AUTO01$ python3 try_preview.py
R1: diff
<span class="hl">+ntp server 10.99.0.61</span>
J1: diff
[edit system ntp]
<span class="hl">+   server 10.99.0.61;</span></pre>
<p>Both devices show one added line, and neither changed. The three dialects side by side, from <code>diffs.py</code>:</p>
<pre class="out">AUTO01$ python3 diffs.py
== R1
+ntp server 10.99.0.61
== J1
[edit system ntp]
+   server 10.99.0.61;
== E1
<span class="hl">@@ -17,6 +17,7 @@</span>
    ip address 3.3.3.3/32
 !
 ntp server 10.99.0.60
+ntp server 10.99.0.61
 !
 router bgp 65003
    router-id 3.3.3.3</pre>

<h3>Candidate from a file</h3>
<p>Larger changes come from a file, for example one rendered by Jinja2 as in <code>py-templates</code>. The call is the same with <code>filename=</code>:</p>
<pre class="code">from nkdev import open_device

with open("ntp-extra.cfg", "w") as f:
    f.write("ntp server 10.99.0.61\\n")
dev = open_device("R1")
dev.load_merge_candidate(filename="ntp-extra.cfg")
print(dev.compare_config())
dev.discard_config()
print(repr(dev.compare_config()))
dev.close()</pre>
<pre class="out">AUTO01$ python3 fromfile.py
+ntp server 10.99.0.61
''</pre>
<p>After <code>discard_config()</code> the diff is the empty string <code>''</code>, shown with <code>repr()</code>. That empty string is how you detect "already done".</p>

<h3>What a bad candidate looks like</h3>
<p>Platforms do not all complain at the same moment. <code>badcand.py</code> loads a nonsense line on three vendors:</p>
<pre class="out">AUTO01$ python3 badcand.py
R1 loaded; diff: '+ntp bogus 1.1.1.1'
J1 <span class="hl">MergeConfigException: syntax error</span>
<span class="hl">E1 loaded; diff: ''</span></pre>
<p>Junos refuses at load time. IOS accepts the line into the candidate (the diff shows it) and only the device can reject it at commit:</p>
<pre class="out">AUTO01$ python3 badcommit.py
+ntp server 10.99.0.61
+ntp bogus 1.1.1.1
MergeConfigException:
Configuration merge failed; automatic rollback attempted:
configure terminal
Enter configuration commands, one per line.  End with CNTL/Z.
PUN-CORE-R1(config)#ntp server 10.99.0.61
PUN-CORE-R1(config)#ntp bogus 1.1.1.1
                        ^
<span class="hl">% Invalid input detected at '^' marker.</span>
PUN-CORE-R1(config)#end
PUN-CORE-R1#
['10.99.0.60']</pre>
<p>The IOS driver reports <code>MergeConfigException</code> with the device dialogue, and the running configuration stayed as it was (<code>['10.99.0.60']</code>), because the driver rolled the partial change back. On EOS the nonsense line produced an <b>empty diff</b>: the lab accepts unsupported lines at load time and shows the problem only through the diff. A real EOS answers at load time. Either way, an empty diff after you loaded something is a warning, not a success.</p>

<div class="warn"><p><b>Common mistakes.</b> Committing without printing the diff; forgetting to discard on the dry-run path; assuming an exception is raised at load on every platform; sending a multi-line candidate with the wrong indentation under a parent command such as <code>router bgp</code>.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>compare_config()</code> returns a <b>string</b>, empty when there is no difference. Its format is platform specific; do not parse it, treat it as a human-readable log.</p></div>

<div class="scn"><h4>The dry run that stayed loaded</h4><p>An engineer tested a template on a Junos router with <code>load_merge_candidate</code> and <code>compare_config</code> and closed the script without <code>discard_config</code>. Later a colleague's script loaded its own candidate on the same router and committed, which carried the first, forgotten lines with it. Nobody saw it until a BGP neighbour appeared.</p><p><b>Lesson:</b> every code path that loads a candidate must end in commit or discard. Put discard in <code>finally</code>.</p></div>

<div class="iv"><p class="q">"Walk me through a safe change with NAPALM."</p><p>Open the device, load the candidate, call compare_config and log the diff, stop if the diff is empty or larger than expected, commit, then verify with a getter. If anything fails I discard or roll back, and I always close the session.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Load, compare, then commit or discard: never write blind.</li>
<li><code>compare_config()</code> returns text; an empty string means no change.</li>
<li>IOS, EOS and Junos produce different diff dialects.</li>
<li>Errors surface at load on Junos but at commit on IOS.</li>
<li>Discard in <code>finally</code> so a candidate never lingers.</li></ul></div>`,hi:`<p>Likhna woh jagah hai jahan scripts network ko chot pahunchati hain, isliye NAPALM aap par ek aadat thopta hai: aap change ko seedha device par kabhi nahi bhejte. Aap candidate <b>load</b> karte ho, device se poochte ho ki kya alag hoga, woh jawab padhte ho, aur tabhi <b>commit</b> ya <b>discard</b> karte ho. Program 1 ke <code>py-safepush</code> aur <code>adv-netconf</code> tatha <code>adv-pyez-config</code> ke candidate datastores ne yahi idea sikhaya; NAPALM ise method names ka ek set deta hai.</p>

<h3>Ek analogy: track changes</h3>
<p>Aap contract ko track changes on karke edit karte ho. Document har insertion aur deletion rang mein dikhata hai, aur accept karne tak kuch final nahi hota. <code>compare_config()</code> rang wala view hai; <code>commit_config()</code> "accept all" hai; <code>discard_config()</code> "reject all" hai.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Candidate workflow">
<rect x="10" y="20" width="110" height="50" rx="8" fill="#bae6fd"/><text x="65" y="42" text-anchor="middle" class="svg-ink" font-size="13">load_merge_candidate</text><text x="65" y="58" text-anchor="middle" class="svg-muted" font-size="10">config= ya filename=</text>
<rect x="150" y="20" width="110" height="50" rx="8" fill="#fde68a"/><text x="205" y="42" text-anchor="middle" class="svg-ink" font-size="13">compare_config</text><text x="205" y="58" text-anchor="middle" class="svg-muted" font-size="10">diff padho</text>
<rect x="290" y="20" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="345" y="42" text-anchor="middle" class="svg-ink" font-size="13">commit_config</text><text x="345" y="58" text-anchor="middle" class="svg-muted" font-size="10">change live ho jaata hai</text>
<rect x="430" y="20" width="110" height="50" rx="8" fill="#e2e8f0"/><text x="485" y="42" text-anchor="middle" class="svg-ink" font-size="13">get_* getters</text><text x="485" y="58" text-anchor="middle" class="svg-muted" font-size="10">result verify karo</text>
<line x1="120" y1="45" x2="150" y2="45" stroke="#64748b" stroke-width="2"/><line x1="260" y1="45" x2="290" y2="45" stroke="#64748b" stroke-width="2"/><line x1="400" y1="45" x2="430" y2="45" stroke="#64748b" stroke-width="2"/>
<rect x="150" y="95" width="250" height="40" rx="8" fill="#fecaca"/><text x="275" y="120" text-anchor="middle" class="svg-ink" font-size="13">discard_config: empty diff, error ya --dry-run</text>
<line x1="205" y1="70" x2="205" y2="95" stroke="#dc2626" stroke-width="2"/>
<text x="565" y="45" text-anchor="middle" class="svg-muted" font-size="12">beech ke do</text><text x="565" y="62" text-anchor="middle" class="svg-muted" font-size="12">kabhi skip nahi</text>
</svg><p class="cap">Load, dekho, phir commit ya discard. Jo change compare nahi hua, woh review nahi hua.</p></div>

<h3>Calls</h3>
<table class="cmp"><tr><th>Call</th><th>Kya karta hai</th></tr>
<tr><td><code>load_merge_candidate(filename=None, config=None)</code></td><td>Running configuration mein <b>jodne</b> wali lines stage karta hai. Text (<code>config=</code>) do ya file ka naam.</td></tr>
<tr><td><code>compare_config()</code></td><td>Difference text ki tarah lautata hai. Khaali string ka matlab candidate kuch nahi badalta.</td></tr>
<tr><td><code>commit_config(message="", revert_in=None)</code></td><td>Candidate ko running configuration bana deta hai.</td></tr>
<tr><td><code>discard_config()</code></td><td>Candidate fenk deta hai. Device ko kuch nahi hota.</td></tr></table>

<h3>Drivers neeche kya karte hain</h3>
<table class="cmp"><tr><th>Driver</th><th>Candidate kahan rehta hai</th><th>Diff kaisa dikhta hai</th></tr>
<tr><td><code>ios</code></td><td>Lab mein driver ki memory (asli gear par flash par file)</td><td>Badalne wali lines, har ek <code>+</code> ya <code>-</code> se shuru, unki parent lines bina prefix ke</td></tr>
<tr><td><code>eos</code></td><td>Switch par configuration session</td><td><code>@@</code> markers wala unified diff (session ka apna diff)</td></tr>
<tr><td><code>junos</code></td><td>Junos candidate database</td><td><code>[edit ...]</code> headings aur <code>+</code>, <code>-</code> lines</td></tr></table>
<p>Har platform wahi sawaal apni boli mein jawab deta hai. Aap diff ko translate nahi karte; insaan ya log use padhta hai.</p>

<h3>Har platform ka ek candidate text</h3>
<p>Aap ab bhi har vendor ki syntax khud likhte ho. Use ek chhote function mein rakho taaki baaki tool vendor-neutral rahe. Yeh Lab 1 ki <code>ntpsync.py</code> ka pehla hissa hai.</p>
<pre class="code">"""ntpsync.py - merge the NTP servers we want into any NAPALM device; always show the diff first"""
import sys

from napalm.base.exceptions import MergeConfigException
from nkdev import DEVICES, open_device

WANT = ["10.99.0.60", "10.99.0.61"]


def candidate(driver, servers):
    """One candidate text per platform: IOS and EOS take CLI lines, Junos takes set lines."""
    if driver == "junos":
        return "".join("set system ntp server %s\\n" % s for s in servers)
    return "".join("ntp server %s\\n" % s for s in servers)


def preview(name, servers):
    """Load the candidate, print the diff, throw the candidate away. Nothing changes on the device."""
    dev = open_device(name)
    try:
        dev.load_merge_candidate(config=candidate(DEVICES[name]["driver"], servers))
        diff = dev.compare_config()
        print("%s: diff" % name)
        print(diff if diff.strip() else "(no difference)")
    finally:
        dev.discard_config()
        dev.close()</pre>
<p><code>preview()</code> hamesha <code>finally</code> mein discard karta hai, chahe diff call fail ho. Bhoola hua candidate bekaar nahi hota: Junos par woh device ke candidate database mein agle commit karne wale ke liye pada rehta hai, aur EOS par switch par configuration session khula chhod deta hai. "discard" ko default exit banao.</p>
<pre class="code">from ntpsync import WANT, preview

for name in ("R1", "J1"):
    preview(name, WANT)</pre>
<pre class="out">AUTO01$ python3 try_preview.py
R1: diff
<span class="hl">+ntp server 10.99.0.61</span>
J1: diff
[edit system ntp]
<span class="hl">+   server 10.99.0.61;</span></pre>
<p>Dono devices ek joda gaya line dikhate hain, aur kisi ne badla nahi. Teeno boliyan saath saath, <code>diffs.py</code> se:</p>
<pre class="out">AUTO01$ python3 diffs.py
== R1
+ntp server 10.99.0.61
== J1
[edit system ntp]
+   server 10.99.0.61;
== E1
<span class="hl">@@ -17,6 +17,7 @@</span>
    ip address 3.3.3.3/32
 !
 ntp server 10.99.0.60
+ntp server 10.99.0.61
 !
 router bgp 65003
    router-id 3.3.3.3</pre>

<h3>File se candidate</h3>
<p>Bade changes file se aate hain, jaise <code>py-templates</code> mein Jinja2 ne render ki hui. Call wahi hai, bas <code>filename=</code> ke saath:</p>
<pre class="code">from nkdev import open_device

with open("ntp-extra.cfg", "w") as f:
    f.write("ntp server 10.99.0.61\\n")
dev = open_device("R1")
dev.load_merge_candidate(filename="ntp-extra.cfg")
print(dev.compare_config())
dev.discard_config()
print(repr(dev.compare_config()))
dev.close()</pre>
<pre class="out">AUTO01$ python3 fromfile.py
+ntp server 10.99.0.61
''</pre>
<p><code>discard_config()</code> ke baad diff khaali string <code>''</code> hai, jo <code>repr()</code> se dikhi. Yahi khaali string batati hai ki "kaam ho chuka hai".</p>

<h3>Kharab candidate kaisa dikhta hai</h3>
<p>Sab platforms ek hi waqt par shikayat nahi karte. <code>badcand.py</code> teen vendors par bekaar line load karti hai:</p>
<pre class="out">AUTO01$ python3 badcand.py
R1 loaded; diff: '+ntp bogus 1.1.1.1'
J1 <span class="hl">MergeConfigException: syntax error</span>
<span class="hl">E1 loaded; diff: ''</span></pre>
<p>Junos load ke waqt mana karta hai. IOS line ko candidate mein le leta hai (diff dikhata hai) aur sirf device hi commit par use reject kar sakta hai:</p>
<pre class="out">AUTO01$ python3 badcommit.py
+ntp server 10.99.0.61
+ntp bogus 1.1.1.1
MergeConfigException:
Configuration merge failed; automatic rollback attempted:
configure terminal
Enter configuration commands, one per line.  End with CNTL/Z.
PUN-CORE-R1(config)#ntp server 10.99.0.61
PUN-CORE-R1(config)#ntp bogus 1.1.1.1
                        ^
<span class="hl">% Invalid input detected at '^' marker.</span>
PUN-CORE-R1(config)#end
PUN-CORE-R1#
['10.99.0.60']</pre>
<p>IOS driver device ke dialogue ke saath <code>MergeConfigException</code> deta hai, aur running configuration waisi hi rahi (<code>['10.99.0.60']</code>), kyunki driver ne adhura change wapas kar diya. EOS par bekaar line ka <b>diff khaali</b> aaya: lab load ke waqt unsupported lines accept kar leta hai aur problem sirf diff se dikhti hai. Asli EOS load ke waqt jawab deta hai. Dono tarah, kuch load karne ke baad khaali diff warning hai, safalta nahi.</p>

<div class="warn"><p><b>Common mistakes.</b> Diff print kiye bina commit karna; dry-run path par discard bhool jana; maan lena ki har platform par load par exception uthegi; <code>router bgp</code> jaise parent command ke neeche galat indentation ke saath multi-line candidate bhejna.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>compare_config()</code> ek <b>string</b> lautata hai, difference na ho to khaali. Uska format platform-specific hai; use parse mat karo, human-readable log maano.</p></div>

<div class="scn"><h4>Dry run jo loaded reh gaya</h4><p>Ek engineer ne Junos router par template ko <code>load_merge_candidate</code> aur <code>compare_config</code> se test kiya aur <code>discard_config</code> ke bina script band kar di. Baad mein saathi ki script ne usi router par apna candidate load karke commit kiya, aur pehle ki bhooli hui lines saath chali gayi. Kisi ne tab tak nahi dekha jab tak ek BGP neighbour nahi dikha.</p><p><b>Lesson:</b> candidate load karne wala har code path commit ya discard par khatam hona chahiye. Discard ko <code>finally</code> mein rakho.</p></div>

<div class="iv"><p class="q">"NAPALM ke saath safe change ka walkthrough do."</p><p>Device kholo, candidate load karo, compare_config bulao aur diff log karo, diff khaali ya expected se bada ho to ruko, commit karo, phir getter se verify karo. Kuch fail ho to discard ya roll back karta hoon, aur session hamesha band karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Load, compare, phir commit ya discard: kabhi andhe mat likho.</li>
<li><code>compare_config()</code> text lautata hai; khaali string ka matlab koi change nahi.</li>
<li>IOS, EOS aur Junos alag diff boliyan banate hain.</li>
<li>Errors Junos par load par, IOS par commit par dikhte hain.</li>
<li>Candidate kabhi atka na rahe isliye <code>finally</code> mein discard karo.</li></ul></div>`}};export{e as default};