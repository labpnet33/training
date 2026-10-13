var e=String.raw`<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="One request keeps the mode">
<rect x="10" y="20" width="290" height="150" rx="8" fill="#bbf7d0"/><text x="155" y="42" text-anchor="middle" class="svg-ink" font-size="13">One request: works</text>
<text x="26" y="68" class="svg-ink" font-size="12">enable</text><text x="26" y="86" class="svg-ink" font-size="12">configure</text><text x="26" y="104" class="svg-ink" font-size="12">interface Loopback11</text><text x="26" y="122" class="svg-ink" font-size="12">description ONE-REQUEST</text><text x="26" y="150" class="svg-muted" font-size="11">the mode carries from line to line</text>
<rect x="340" y="20" width="290" height="150" rx="8" fill="#fecaca"/><text x="485" y="42" text-anchor="middle" class="svg-ink" font-size="13">Two requests: fails</text>
<text x="356" y="68" class="svg-ink" font-size="12">request 1: enable, configure,</text><text x="356" y="86" class="svg-ink" font-size="12">          interface Loopback11</text><text x="356" y="112" class="svg-ink" font-size="12">request 2: enable,</text><text x="356" y="130" class="svg-ink" font-size="12">          description SPLIT</text><text x="356" y="156" class="svg-muted" font-size="11">request 2 starts in exec mode again</text>
</svg></div>
<p class="cap">The switch forgets the mode between requests. Send an interface and its sub-commands together.</p>`,t=String.raw`<pre class="code"><span class="c"># d_cfg.py - config(), section(), get_config() and running_config</span>
import pyeapi

node = pyeapi.connect_to("leaf1")
print(node.config(["interface Loopback10", "description NK-DEMO", "ip address 10.250.0.1/32"]))
print(node.section("interface Loopback10"))
print(node.get_config(params="section Loopback10", as_string=True))
print(len(node.running_config.splitlines()) > 20, node.running_config.splitlines()[0])
print(node.config("no interface Loopback10"))
try:
    node.get_config("foo")
except TypeError as err:
    print("TypeError:", err)</pre>
<pre class="out">AUTO01$ python3 d_cfg.py
[{}, {}, {}]
interface Loopback10
   description NK-DEMO
   no shutdown
   ip address 10.250.0.1/32
!
interface Loopback10
   description NK-DEMO
   ip address 10.250.0.1/32
True ! Command: show running-config
[{}]
TypeError: <span class="hl">invalid config name specified</span></pre>`,n=String.raw`<pre class="code"><span class="c"># d_cfg2.py - what a failure in the middle of a list leaves behind</span>
import pyeapi
from pyeapi.eapilib import CommandError

node = pyeapi.connect_to("leaf1")
try:
    node.config(["interface Loopback11", "bogus command"])
except CommandError as err:
    print(err)
print(node.api("interfaces").get("Loopback11"))
node.config("interface Loopback11")
try:
    node.config("description SPLIT")
except CommandError as err:
    print(err)
print(node.config(["interface Loopback11", "description ONE-REQUEST"]))
print(node.api("interfaces").get("Loopback11")["description"])
node.config("no interface Loopback11")</pre>
<pre class="out">AUTO01$ python3 d_cfg2.py
Error [1002]: CLI command 4 of 4 'bogus command' failed: invalid command [Invalid input (at token 0: 'bogus')]
{'name': 'Loopback11', 'type': 'loopback', 'shutdown': False, 'description': None}
Error [1002]: CLI command 3 of 3 'description SPLIT' failed: invalid command [Invalid input (at token 0: 'description')]
[{}, {}]
ONE-REQUEST</pre>`,r={id:`configure`,h:{en:`Configuring with node.config() and reading it back`,hi:`node.config() se configure karna aur wapas padhna`},body:{en:`
<p>Reading is safe. Writing is where a script can hurt you. This chapter shows how <code>node.config()</code> works, how to read configuration back, and the two surprises that bite everyone once: the mode that does not carry over, and the failure that does not roll back.</p>

<h3>config(): configure mode in one request</h3>
<p><code>node.config(commands)</code> puts <code>configure</code> in front of your lines (after the hidden <code>enable</code>) and sends the lot as one request. It takes a string or a list. The return value is a list with one empty dictionary per command of yours.</p>
`+t+`
<ul>
<li><code>[{}, {}, {}]</code>: three commands, three empty results. Configuration commands have no output; an empty dictionary is success.</li>
<li><code>node.section("interface Loopback10")</code> returns the matching block of the running-config as text. Note the line <code>no shutdown</code>: it is how EOS shows the default state in the running-config, and it disappears from the second form.</li>
<li><code>get_config(params="section Loopback10", as_string=True)</code> reads from the running-config with a <code>section</code> filter. Without <code>as_string</code> you get a list of lines.</li>
<li><code>node.running_config</code> is the whole file as one string; it is fetched on first use and cached on the Node.</li>
<li><code>get_config("foo")</code> raises <code>TypeError</code>: the first argument is the <i>name</i> of a config (<code>running-config</code> or <code>startup-config</code>), not a filter.</li>
</ul>
<div class="warn"><p><b>Common mistake.</b> Reading <code>node.running_config</code> after a change and getting the old text. The Node cached it. Make a fresh Node, or read with <code>get_config</code> again, when you need the state after your own change.</p></div>

<h3>The mode does not carry over</h3>
<p>Every request starts in privileged exec mode. An <code>interface</code> line sets the mode for the lines <i>after it, inside the same request</i>. A second call begins again at the top.</p>
`+e+`
<h3>A failure does not roll back</h3>
<p>Here a list with a typo in the last line is sent, then the same interface is checked.</p>
`+n+`
<ol>
<li>The typo raised <code>CommandError 1002</code> at "command 4 of 4". That is enable, configure, interface, then the bad one.</li>
<li>The interface <code>Loopback11</code> <b>exists anyway</b>. The first lines were applied. Only the bad line was refused.</li>
<li>Sending <code>description SPLIT</code> alone fails at token 0: in a new request the switch is in exec mode, where <code>description</code> is not a command.</li>
<li>Sending the interface and the description together works.</li>
</ol>
<p>If a half-applied change is not acceptable, the answer is a <b>config session</b> (next chapter), not more careful typing.</p>
<div class="exam"><p><b>Exam trap.</b> <code>config()</code> is not transactional. It stops at the first error but keeps what already ran, and it never saves to the startup-config. After a reboot only <code>copy running-config startup-config</code> (or <code>write</code>) would have kept it.</p></div>
<div class="note"><p><b>Saving.</b> To persist a change send <code>node.run_commands("write memory")</code> (the same as <code>copy running-config startup-config</code>) as a separate step, after you have verified the change. Do not save a configuration you have not checked.</p></div>

<h3>Idempotence: describe the end state</h3>
<p>Sending <code>vlan 110</code> twice is harmless, but <code>ip address</code> or <code>neighbor ... remote-as</code> with a different value replaces the old one, and some commands toggle. Write scripts that compare first and change only when needed. Chapter 8 does exactly that with the api modules.</p>

<div class="scn"><h4>Twenty lines, nineteen applied</h4><p>A change pushed 20 lines to an access switch. Line 14 had a trailing space inside a name, which EOS rejected. The script printed the exception and stopped. Lines 1 to 13 were live, 15 to 20 were not, and the port-channel was half built. Recovery took an hour of reading diffs.</p><p><b>Lesson:</b> for any list longer than a couple of lines, stage it in a config session and look at the diff first.</p></div>

<div class="iv"><p class="q">"A node.config() call raised CommandError halfway. What state is the switch in?"</p><p>Partly changed. EOS applies configuration lines as it receives them and stops at the failing one. The earlier lines stay in the running-config, the later ones were never run, and nothing is saved to startup-config. I read the exception's <code>output</code> to see how far it got, and for risky changes I use a config session so the change is all or nothing.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>node.config(list)</code> sends <code>configure</code> plus your lines as one request; success is a list of empty dictionaries.</li>
<li>Read back with <code>section()</code>, <code>get_config(params=..., as_string=True)</code> or the cached <code>running_config</code>.</li>
<li>The mode does not carry between requests: send an interface and its sub-commands together.</li>
<li>A failed line leaves the earlier lines applied; <code>config()</code> is not transactional.</li>
<li>Nothing is saved to startup-config until you do it on purpose.</li>
</ul></div>
`,hi:`
<p>Padhna surakshit hai. Likhna woh jagah hai jahan script aapko nuksan pahuncha sakti hai. Yeh chapter dikhata hai <code>node.config()</code> kaise kaam karta hai, configuration wapas kaise padhte hain, aur woh do surprise jo har kisi ko ek baar kaat-te hain: mode jo aage nahi jaata, aur failure jo rollback nahi hota.</p>

<h3>config(): ek request mein configure mode</h3>
<p><code>node.config(commands)</code> aapki lines ke aage <code>configure</code> lagata hai (chhupe hue <code>enable</code> ke baad) aur sab ek request mein bhejta hai. String ya list leta hai. Return value aapke har command ke liye ek khaali dictionary wali list hai.</p>
`+t+`
<ul>
<li><code>[{}, {}, {}]</code>: teen commands, teen khaali results. Configuration commands ka output nahi hota; khaali dictionary matlab success.</li>
<li><code>node.section("interface Loopback10")</code> running-config ka matching block text mein lautata hai. <code>no shutdown</code> line dekho: EOS default state running-config mein aise dikhata hai, aur doosre form mein woh gayab hai.</li>
<li><code>get_config(params="section Loopback10", as_string=True)</code> running-config se <code>section</code> filter ke saath padhta hai. <code>as_string</code> ke bina lines ki list milti hai.</li>
<li><code>node.running_config</code> poori file ek string mein hai; pehli baar use par aati hai aur Node par cache hoti hai.</li>
<li><code>get_config("foo")</code> <code>TypeError</code> deta hai: pehla argument config ka <i>naam</i> hai (<code>running-config</code> ya <code>startup-config</code>), filter nahi.</li>
</ul>
<div class="warn"><p><b>Common mistake.</b> Change ke baad <code>node.running_config</code> padhna aur purana text milna. Node ne cache kar liya tha. Apne change ke baad ki state chahiye to naya Node banao, ya <code>get_config</code> dobara chalao.</p></div>

<h3>Mode aage nahi jaata</h3>
<p>Har request privileged exec mode se shuru hoti hai. <code>interface</code> line sirf <i>usi request ke andar uske baad</i> ki lines ke liye mode set karti hai. Doosri call phir upar se shuru hoti hai.</p>
`+e+`
<h3>Failure rollback nahi hota</h3>
<p>Yahan aakhri line mein typo wali list bheji gayi, phir wahi interface check kiya.</p>
`+n+`
<ol>
<li>Typo ne "command 4 of 4" par <code>CommandError 1002</code> diya. Yaani enable, configure, interface, phir bura wala.</li>
<li>Interface <code>Loopback11</code> <b>phir bhi maujood hai</b>. Shuru ki lines lag gayi thi. Sirf bura line mana hua.</li>
<li><code>description SPLIT</code> akela bhejna token 0 par fail hota hai: nayi request mein switch exec mode mein hai, jahan <code>description</code> command nahi hai.</li>
<li>Interface aur description saath bhejna chalta hai.</li>
</ol>
<p>Aadha-laga change manzoor na ho to jawab <b>config session</b> hai (agla chapter), zyada dhyan se type karna nahi.</p>
<div class="exam"><p><b>Exam trap.</b> <code>config()</code> transactional nahi hai. Pehli error par rukta hai par jo chal chuka woh rakhta hai, aur startup-config mein kabhi save nahi karta. Reboot ke baad sirf <code>copy running-config startup-config</code> (ya <code>write</code>) use bacha leta.</p></div>
<div class="note"><p><b>Save karna.</b> Change persist karne ke liye alag step mein <code>node.run_commands("write memory")</code> bhejo (wahi jo <code>copy running-config startup-config</code>), change verify karne ke baad. Jo configuration check nahi ki use save mat karo.</p></div>

<h3>Idempotence: end state batao</h3>
<p><code>vlan 110</code> do baar bhejna harmless hai, par <code>ip address</code> ya <code>neighbor ... remote-as</code> alag value ke saath purani ko replace kar deta hai, aur kuch commands toggle karte hain. Aisi scripts likho jo pehle compare karein aur zaroorat par hi badlein. Chapter 8 api modules ke saath yahi karta hai.</p>

<div class="scn"><h4>Bees lines, unnees lagi</h4><p>Ek change ne access switch par 20 lines bheji. Line 14 ke naam mein trailing space tha, jo EOS ne reject kiya. Script ne exception print kiya aur ruk gayi. Lines 1 se 13 live thi, 15 se 20 nahi, aur port-channel aadha bana tha. Recovery mein ek ghanta diffs padhne mein gaya.</p><p><b>Lesson:</b> do-teen lines se lambi list ke liye use config session mein stage karo aur pehle diff dekho.</p></div>

<div class="iv"><p class="q">"node.config() beech mein CommandError de gaya. Switch ki state kya hai?"</p><p>Aadhi badli hui. EOS configuration lines milte hi lagata hai aur fail hone wali par ruk jaata hai. Pehli lines running-config mein rehti hain, baad ki chali hi nahi, aur startup-config mein kuch save nahi hota. Exception ka <code>output</code> padh kar dekhta hoon kitna chala, aur risky change ke liye config session use karta hoon taaki change all-or-nothing ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>node.config(list)</code> <code>configure</code> aur aapki lines ek request mein bhejta hai; success matlab khaali dictionaries ki list.</li>
<li><code>section()</code>, <code>get_config(params=..., as_string=True)</code> ya cached <code>running_config</code> se wapas padho.</li>
<li>Mode requests ke beech nahi jaata: interface aur uske sub-commands saath bhejo.</li>
<li>Fail hue line se pehle ki lines lagi rehti hain; <code>config()</code> transactional nahi hai.</li>
<li>Startup-config mein tab tak kuch save nahi jab tak aap jaan-boojh kar na karo.</li>
</ul></div>
`}};export{r as default};