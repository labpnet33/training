var e=String.raw`<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="pyeapi exception classes">
<rect x="230" y="12" width="180" height="36" rx="8" fill="#ddd6fe"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">EapiError</text>
<rect x="60" y="86" width="210" height="40" rx="8" fill="#fde68a"/><text x="165" y="104" text-anchor="middle" class="svg-ink" font-size="13">ConnectionError</text><text x="165" y="119" text-anchor="middle" class="svg-muted" font-size="11">no usable answer</text>
<rect x="370" y="86" width="210" height="40" rx="8" fill="#fecaca"/><text x="475" y="104" text-anchor="middle" class="svg-ink" font-size="13">CommandError</text><text x="475" y="119" text-anchor="middle" class="svg-muted" font-size="11">the switch said no</text>
<rect x="60" y="160" width="210" height="36" rx="8" fill="#bbf7d0"/><text x="165" y="183" text-anchor="middle" class="svg-ink" font-size="13">HttpError (401, 5xx)</text>
<line x1="290" y1="48" x2="165" y2="86" stroke="#64748b" stroke-width="2"/><line x1="350" y1="48" x2="475" y2="86" stroke="#64748b" stroke-width="2"/><line x1="165" y1="126" x2="165" y2="160" stroke="#64748b" stroke-width="2"/>
</svg></div>
<p class="cap">Two families: the switch could not be reached (ConnectionError) or it was reached and refused a command (CommandError).</p>`,t=String.raw`<pre class="code"><span class="c"># d_err.py - everything a CommandError carries</span>
import pyeapi
from pyeapi.eapilib import CommandError, ConnectionError, EapiError, HttpError

print(issubclass(HttpError, ConnectionError), issubclass(ConnectionError, EapiError), issubclass(CommandError, EapiError))
node = pyeapi.connect_to("leaf1")
try:
    node.run_commands(["show hostname", "show ip bgp sumary"])
except CommandError as err:
    print("code      :", err.error_code)
    print("text      :", err.error_text)
    print("detail    :", err.command_error)
    print("commands  :", err.commands)
    print("output    :", err.output)
    print("str(err)  :", err)
bad = pyeapi.connect(host="10.99.0.11", username="netops", password="wrong", return_node=True)
try:
    bad.run_commands("show hostname")
except ConnectionError as err:
    print(type(err).__name__, "|", err)</pre>
<pre class="out">AUTO01$ python3 d_err.py
True True True
code      : <span class="hl">1002</span>
text      : CLI command 3 of 3 'show ip bgp sumary' failed: invalid command
detail    : Invalid input (at token 3: 'sumary')
commands  : ['enable', 'show hostname', 'show ip bgp sumary']
output    : [{}, {'fqdn': 'LEAF1', 'hostname': 'LEAF1'}, {'errors': ["Invalid input (at token 3: 'sumary')"]}]
str(err)  : Error [1002]: CLI command 3 of 3 'show ip bgp sumary' failed: invalid command [Invalid input (at token 3: 'sumary')]
HttpError | Unauthorized. Check the user name and password (HT&#84;P 401)</pre>`,n=String.raw`<pre class="code"><span class="c"># fleetcheck.py (Lab 2) - the shape of a script that survives bad switches</span>
import pyeapi
from pyeapi.eapilib import CommandError, ConnectionError

ok = 0
for name in LEAVES:
    try:
        print("%-6s OK    %s" % (name, check(name)))
        ok += 1
    except CommandError as err:
        print("%-6s CMD   CommandError code=%s: %s" % (name, err.error_code, err))
    except ConnectionError as err:
        print("%-6s DOWN  %s: %s" % (name, type(err).__name__, err))
print("%d of %d leaves answered" % (ok, len(LEAVES)))</pre>
<pre class="out">AUTO01$ python3 fleetcheck.py
leaf1  DOWN  HttpError: Unauthorized. Check the user name and password (HT&#84;P 401)
leaf2  DOWN  ConnectionError: Socket error during eAPI connection: <span class="hl">[Errno 111] Connection refused</span>
leaf3  DOWN  ConnectionError: Socket error during eAPI connection: <span class="hl">timed out</span>
0 of 3 leaves answered</pre>`,r={id:`errors`,h:{en:`Errors: CommandError, ConnectionError and what each means`,hi:`Errors: CommandError, ConnectionError aur har ek ka matlab`},body:{en:`
<p>A script that talks to fifty switches will meet a bad password, a switch in a reload and a typo, often on the same night. pyeapi gives you exceptions that say <i>which kind</i> of problem it is. Read them correctly and half of troubleshooting is done before you open a terminal. This chapter prepares Lab 2.</p>

<h3>Two families</h3>
`+e+`
<p>All pyeapi exceptions live in <code>pyeapi.eapilib</code> and inherit from <code>EapiError</code>.</p>
<ul>
<li><b>ConnectionError</b>: no usable answer came back. The cause is the network, TLS, the port or the login. <code>HttpError</code> is a child, raised when the web server answers with a bad status such as 401.</li>
<li><b>CommandError</b>: the switch answered, and the answer was an <code>error</code> object. The cause is the command, the mode or the privilege.</li>
</ul>
<div class="warn"><p><b>Common mistake.</b> pyeapi's <code>ConnectionError</code> is <i>not</i> Python's built-in of the same name. If you write <code>except ConnectionError</code> without importing it from <code>pyeapi.eapilib</code>, you catch the wrong class and the pyeapi error flies straight past. Always import both exception names explicitly.</p></div>

<h3>Everything a CommandError carries</h3>
<p>The exception is more than a message. It remembers the request and the results so far.</p>
`+t+`
<table class="cmp"><tr><th>Attribute</th><th>Holds</th><th>Use it to</th></tr>
<tr><td><code>error_code</code></td><td>The EOS number, here 1002</td><td>Branch on the kind of failure</td></tr>
<tr><td><code>error_text</code></td><td>Which command of how many, and why</td><td>Log a clear line</td></tr>
<tr><td><code>command_error</code></td><td>The CLI's own complaint, with the token where it gave up</td><td>Spot the typo: <code>at token 3: 'sumary'</code></td></tr>
<tr><td><code>commands</code></td><td>The full list sent, <code>enable</code> first</td><td>Rebuild what was attempted</td></tr>
<tr><td><code>output</code></td><td>Results of the commands that did run, then the error entry</td><td>Keep the good part of a partial run</td></tr></table>
<p>Note the numbering: "command 3 of 3" for a call with two commands of yours. The <code>enable</code> is number one.</p>

<h3>Failures that never reach JSON</h3>
<p>Run the Lab 2 script and read the three messages. Each is a different layer.</p>
`+n+`
<table class="cmp"><tr><th>Message</th><th>Layer</th><th>Usual cause</th></tr>
<tr><td><code>HttpError ... (HT&#84;P 401)</code></td><td>Login</td><td>Wrong user or password in the profile</td></tr>
<tr><td><code>[Errno 111] Connection refused</code></td><td>TCP</td><td>Nothing listens: eAPI is shut, or the wrong port</td></tr>
<tr><td><code>timed out</code></td><td>Network</td><td>Packets are dropped: an ACL, a firewall or a route</td></tr>
<tr><td><code>unable to connect to eAPI</code></td><td>Protocol</td><td>Plain <code>h&#116;tp</code> spoken to a TLS-only port</td></tr>
<tr><td><code>CommandError 1002 ... 'enable' failed [Invalid password]</code></td><td>Privilege</td><td>The user is below 15 and the profile has no <code>enablepwd</code></td></tr></table>
<p>"Refused" is fast and "timed out" is slow. That one fact tells you whether something answers and says no (a closed service) or nothing answers at all (a filter). Chapter 10 walks the whole ladder.</p>
<div class="note"><p><b>In the lab vs on real gear.</b> The lab raises <code>HttpError</code> for a 401. Real pyeapi may raise a plain <code>ConnectionError</code> with the text "unable to connect to eAPI" for some login failures. Catch <code>ConnectionError</code> (the parent) and you are right on both. The "unable to connect" text for plain <code>h&#116;tp</code> to a TLS port is how the lab words it; real switches word it differently.</p></div>

<h3>What to retry</h3>
<ul>
<li><b>ConnectionError</b> with refused or timed out: retry a few times with a pause; the switch may be reloading.</li>
<li><b>401</b>: do not loop. Repeated bad logins lock accounts or fill AAA logs. Stop and fix the credential.</li>
<li><b>CommandError</b>: never retry unchanged. The same typo fails the same way. Log <code>err.output</code> and move on.</li>
</ul>
<div class="exam"><p><b>Exam trap.</b> A <code>CommandError</code> in the middle of a configuration list does not roll back the lines before it. The earlier lines are already applied (chapter 6 shows it). That is the reason for config sessions.</p></div>

<div class="scn"><h4>The silent half of the fleet</h4><p>A nightly job looped over 40 leaves with a bare <code>except Exception: pass</code>. After an AAA change, 9 leaves rejected the login for two weeks. Nothing was logged, and those 9 were simply never audited. A catch that prints the class and message (<code>HttpError: Unauthorized</code>) would have shown it on day one.</p><p><b>Lesson:</b> catch the two pyeapi families separately and always log the class name and message.</p></div>

<div class="iv"><p class="q">"A pyeapi call raised an exception. How do you decide what to do?"</p><p>First the class. <code>CommandError</code> means the switch was reached and refused the command: read <code>error_code</code>, <code>command_error</code> and <code>output</code>, fix the command, do not retry. <code>ConnectionError</code> means no usable answer: read the text to place the layer (login, refused, timed out) and check the service, ACL or credentials. Only the transient connection errors are worth a retry.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Import <code>CommandError</code> and <code>ConnectionError</code> from <code>pyeapi.eapilib</code>; the built-in <code>ConnectionError</code> is a different class.</li>
<li><code>CommandError</code> carries <code>error_code</code>, <code>error_text</code>, <code>command_error</code>, <code>commands</code> and the partial <code>output</code>.</li>
<li>Refused is a closed service, timed out is a filter, 401 is credentials, 1002 on <code>enable</code> is privilege.</li>
<li>Retry only transient connection errors; never retry a CommandError or a 401 in a loop.</li>
<li>Log the class name and the message for every failed switch.</li>
</ul></div>
`,hi:`
<p>Pachaas switches se baat karne wali script ko galat password, reload hota switch aur typo, aksar ek hi raat mein milte hain. pyeapi aise exceptions deta hai jo batate hain ki <i>kis kism</i> ki problem hai. Unhe sahi padho to troubleshooting ka aadha kaam terminal kholne se pehle ho jaata hai. Yeh chapter Lab 2 ki taiyari hai.</p>

<h3>Do families</h3>
`+e+`
<p>Saare pyeapi exceptions <code>pyeapi.eapilib</code> mein hain aur <code>EapiError</code> se inherit karte hain.</p>
<ul>
<li><b>ConnectionError</b>: koi kaam ka answer nahi aaya. Wajah network, TLS, port ya login hai. <code>HttpError</code> iska child hai, jab web server 401 jaise bure status se jawab de.</li>
<li><b>CommandError</b>: switch ne jawab diya, aur jawab <code>error</code> object tha. Wajah command, mode ya privilege hai.</li>
</ul>
<div class="warn"><p><b>Common mistake.</b> pyeapi ka <code>ConnectionError</code> Python ke built-in usi naam wale class se <i>alag</i> hai. Agar aap <code>pyeapi.eapilib</code> se import kiye bina <code>except ConnectionError</code> likhte ho to galat class pakadte ho aur pyeapi ka error seedha nikal jaata hai. Dono exception naam hamesha explicitly import karo.</p></div>

<h3>CommandError mein kya-kya hota hai</h3>
<p>Exception sirf message nahi hai. Yeh request aur ab tak ke results yaad rakhta hai.</p>
`+t+`
<table class="cmp"><tr><th>Attribute</th><th>Kya rakhta hai</th><th>Kis kaam ka</th></tr>
<tr><td><code>error_code</code></td><td>EOS ka number, yahan 1002</td><td>Failure ki kism par branch karo</td></tr>
<tr><td><code>error_text</code></td><td>Kitne mein se kaunsa command, aur kyun</td><td>Saaf line log karo</td></tr>
<tr><td><code>command_error</code></td><td>CLI ki apni shikayat, aur jis token par ruka</td><td>Typo pakdo: <code>at token 3: 'sumary'</code></td></tr>
<tr><td><code>commands</code></td><td>Bheji gayi poori list, <code>enable</code> pehle</td><td>Kya try hua tha dobara banao</td></tr>
<tr><td><code>output</code></td><td>Jo commands chale unke results, phir error entry</td><td>Partial run ka achha hissa rakho</td></tr></table>
<p>Numbering dekho: aapke do commands ki call mein "command 3 of 3". <code>enable</code> number ek hai.</p>

<h3>Jo failures JSON tak pahunchte hi nahi</h3>
<p>Lab 2 ki script chalao aur teen messages padho. Har ek alag layer hai.</p>
`+n+`
<table class="cmp"><tr><th>Message</th><th>Layer</th><th>Aam wajah</th></tr>
<tr><td><code>HttpError ... (HT&#84;P 401)</code></td><td>Login</td><td>Profile mein galat user ya password</td></tr>
<tr><td><code>[Errno 111] Connection refused</code></td><td>TCP</td><td>Koi sun nahi raha: eAPI shut hai, ya galat port</td></tr>
<tr><td><code>timed out</code></td><td>Network</td><td>Packets drop ho rahe hain: ACL, firewall ya route</td></tr>
<tr><td><code>unable to connect to eAPI</code></td><td>Protocol</td><td>TLS-only port se plain <code>h&#116;tp</code> bola gaya</td></tr>
<tr><td><code>CommandError 1002 ... 'enable' failed [Invalid password]</code></td><td>Privilege</td><td>User 15 se neeche hai aur profile mein <code>enablepwd</code> nahi</td></tr></table>
<p>"Refused" tez hai aur "timed out" dheema. Yeh ek baat batati hai ki koi jawab dekar mana kar raha hai (band service) ya koi jawab hi nahi de raha (filter). Chapter 10 poori seedhi chadhta hai.</p>
<div class="note"><p><b>Lab vs real gear.</b> Lab 401 par <code>HttpError</code> raise karta hai. Asli pyeapi kuch login failures par "unable to connect to eAPI" text ke saath plain <code>ConnectionError</code> raise kar sakta hai. <code>ConnectionError</code> (parent) pakdo to dono par sahi ho. TLS port par plain <code>h&#116;tp</code> ka "unable to connect" text lab ka shabd hai; asli switch alag shabd deta hai.</p></div>

<h3>Kya retry karna hai</h3>
<ul>
<li><b>ConnectionError</b> refused ya timed out ke saath: thodi der ruk kar kuch baar retry karo; switch reload ho raha ho sakta hai.</li>
<li><b>401</b>: loop mat karo. Baar-baar bure login account lock karte hain ya AAA logs bhar dete hain. Ruko aur credential theek karo.</li>
<li><b>CommandError</b>: bina badle kabhi retry mat karo. Wahi typo wahi tarah fail hoga. <code>err.output</code> log karo aur aage badho.</li>
</ul>
<div class="exam"><p><b>Exam trap.</b> Configuration list ke beech mein <code>CommandError</code> aaye to usse pehle ki lines rollback nahi hoti. Pehle ki lines lag chuki hoti hain (chapter 6 dikhata hai). Config sessions isi liye hain.</p></div>

<div class="scn"><h4>Fleet ka chupa hua aadha hissa</h4><p>Ek nightly job 40 leaves par bare <code>except Exception: pass</code> ke saath loop karti thi. AAA change ke baad 9 leaves do hafte login reject karte rahe. Kuch log nahi hua, aur woh 9 kabhi audit hi nahi hue. Class aur message print karne wala catch (<code>HttpError: Unauthorized</code>) pehle din dikha deta.</p><p><b>Lesson:</b> pyeapi ki dono families alag pakdo aur class naam aur message hamesha log karo.</p></div>

<div class="iv"><p class="q">"pyeapi call ne exception diya. Kya karna hai kaise tay karte ho?"</p><p>Pehle class. <code>CommandError</code> matlab switch tak pahunche aur command mana hua: <code>error_code</code>, <code>command_error</code> aur <code>output</code> padho, command theek karo, retry nahi. <code>ConnectionError</code> matlab koi kaam ka jawab nahi: text padh kar layer pehchano (login, refused, timed out) aur service, ACL ya credentials dekho. Sirf transient connection errors retry ke layak hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>CommandError</code> aur <code>ConnectionError</code> <code>pyeapi.eapilib</code> se import karo; built-in <code>ConnectionError</code> alag class hai.</li>
<li><code>CommandError</code> mein <code>error_code</code>, <code>error_text</code>, <code>command_error</code>, <code>commands</code> aur partial <code>output</code> hota hai.</li>
<li>Refused matlab band service, timed out matlab filter, 401 credentials, <code>enable</code> par 1002 privilege.</li>
<li>Sirf transient connection errors retry karo; CommandError ya 401 kabhi loop mein nahi.</li>
<li>Har failed switch ka class naam aur message log karo.</li>
</ul></div>
`}};export{r as default};