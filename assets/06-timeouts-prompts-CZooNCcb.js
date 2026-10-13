var e=(e,t)=>`<div class="dia">`+e+`<p class="cap">`+t+`</p></div>`,t=`<svg viewBox="0 0 640 170" role="img" aria-label="Where the three timeouts apply">
<rect x="10" y="40" width="190" height="56" rx="8" fill="#bae6fd"/><text x="105" y="64" text-anchor="middle" class="svg-ink" font-size="13">TCP connect to port 22</text><text x="105" y="82" text-anchor="middle" class="svg-muted" font-size="11">timeout_socket (15 s)</text>
<rect x="225" y="40" width="190" height="56" rx="8" fill="#fde68a"/><text x="320" y="64" text-anchor="middle" class="svg-ink" font-size="13">SSH login and reads</text><text x="320" y="82" text-anchor="middle" class="svg-muted" font-size="11">timeout_transport (30 s)</text>
<rect x="440" y="40" width="190" height="56" rx="8" fill="#bbf7d0"/><text x="535" y="64" text-anchor="middle" class="svg-ink" font-size="13">one whole operation</text><text x="535" y="82" text-anchor="middle" class="svg-muted" font-size="11">timeout_ops (30 s)</text>
<line x1="200" y1="68" x2="225" y2="68" stroke="#64748b" stroke-width="2"/><line x1="415" y1="68" x2="440" y2="68" stroke="#64748b" stroke-width="2"/>
<text x="105" y="125" text-anchor="middle" class="svg-muted" font-size="11">fails: ScrapliConnectionNotOpened</text>
<text x="320" y="125" text-anchor="middle" class="svg-muted" font-size="11">fails: ScrapliAuthenticationFailed or timeout</text>
<text x="535" y="125" text-anchor="middle" class="svg-muted" font-size="11">fails: ScrapliTimeout</text>
</svg>`,n={id:`timeouts-prompts`,h:{en:`Timeouts, prompts, privilege levels and dead devices`,hi:`Timeouts, prompts, privilege levels aur dead devices`},body:{en:`
<p><b>The idea of this chapter:</b> a script that talks to hundreds of devices will meet devices that do not answer, answer slowly, or answer with something the driver does not expect. scrapli has three timeouts, a family of exceptions and a model of privilege levels to deal with this. Knowing which is which turns a mystery into a one-line fix.</p>

<h3>The three timeouts</h3>
`+e(t,`Each timeout guards a different stage. Defaults on real gear: 15, 30 and 30 seconds.`)+`
<table class="cmp"><tr><th>Argument</th><th>Guards</th><th>When to change it</th></tr>
<tr><td><code>timeout_socket</code></td><td>the TCP connection to port 22</td><td>lower it (5 s) on a LAN so dead devices fail fast; raise it over a slow WAN</td></tr>
<tr><td><code>timeout_transport</code></td><td>the SSH layer: login and each read</td><td>raise it for devices with a slow AAA server</td></tr>
<tr><td><code>timeout_ops</code></td><td>one whole operation, for example one <code>send_command</code></td><td>raise it for slow commands (<code>show tech-support</code>, large <code>show ip route</code>); you can also pass <code>timeout_ops=</code> to a single call</td></tr></table>
<p>The three were already in the <code>device_params()</code> of Lab 1 (5, 10 and 30). A timeout does not make a slow device faster; it decides how long you wait before you give up.</p>
<div class="note"><p><b>In the lab vs on real gear.</b> The lab accepts all three arguments but does not simulate slow devices, so you cannot reproduce a <code>ScrapliTimeout</code> here, and the lab has no real clock to wait on. A dead host fails at once with <code>ScrapliConnectionNotOpened</code>. On real gear that same failure takes <code>timeout_socket</code> seconds, and a hung command raises <code>ScrapliTimeout</code> after <code>timeout_ops</code> seconds.</p></div>

<h3>The exception family</h3>
<table class="cmp"><tr><th>Exception</th><th>Means</th><th>Retry?</th></tr>
<tr><td><code>ScrapliAuthenticationFailed</code></td><td>wrong user, password or key</td><td><b>never</b>: repeated bad logins lock accounts</td></tr>
<tr><td><code>ScrapliConnectionNotOpened</code></td><td>unreachable, port closed, driver cannot find the prompt, or a command sent before <code>open()</code></td><td>yes for network trouble, no for a code bug</td></tr>
<tr><td><code>ScrapliTimeout</code></td><td>an operation took longer than <code>timeout_ops</code></td><td>only for read-only commands</td></tr>
<tr><td><code>ScrapliModuleNotFound</code></td><td>platform name is not a core platform</td><td>no: fix the inventory</td></tr>
<tr><td><code>ScrapliTypeError</code>, <code>ScrapliValueError</code></td><td>wrong argument type or empty host</td><td>no: fix the code</td></tr>
<tr><td><code>ScrapliCommandFailure</code></td><td>you called <code>raise_for_status()</code> on a failed Response</td><td>no: read the output</td></tr>
<tr><td><code>ScrapliException</code></td><td>the base class of all of them</td><td>catch it last</td></tr></table>

<h3>Retry the network, never the password</h3>
<p>The retry helper below shows the rule. It retries only <code>ScrapliConnectionNotOpened</code>, waits a little longer each time, and lets <code>ScrapliAuthenticationFailed</code> pass straight through. It also uses <code>on_open</code>, a function that scrapli calls right after the login.</p>
<pre class="code">import time

from scrapli import Scrapli
from scrapli.exceptions import ScrapliAuthenticationFailed, ScrapliConnectionNotOpened


def open_with_retry(params, tries=3):
    for attempt in range(1, tries + 1):
        conn = Scrapli(**params)
        try:
            conn.open()
            return conn
        except ScrapliAuthenticationFailed:
            raise
        except ScrapliConnectionNotOpened:
            print(f"attempt {attempt}/{tries}: {params['host']} did not answer")
            time.sleep(attempt)
    raise ConnectionError(f"{params['host']} unreachable after {tries} attempts")


def announce(conn):
    print(f"on_open hook: {conn.host} prompt {conn.get_prompt()}")


base = {"platform": "cisco_iosxe", "auth_username": "netops", "auth_password": "NK@2026",
        "auth_secondary": "NK@2026", "auth_strict_key": False,
        "timeout_socket": 5, "timeout_transport": 10, "timeout_ops": 30}
good = open_with_retry(dict(base, host="10.99.0.1", on_open=announce))
good.close()
try:
    open_with_retry(dict(base, host="10.99.0.99"))
except ConnectionError as err:
    print("giving up:", err)
try:
    open_with_retry(dict(base, host="10.99.0.1", auth_password="wrong"))
except ScrapliAuthenticationFailed as err:
    print("not retried:", err)

idle = Scrapli(**dict(base, host="10.99.0.1"))
try:
    idle.send_command("show clock")
except ScrapliConnectionNotOpened as err:
    print("before open():", err)</pre>
<pre class="out">AUTO01$ python3 ch6.py
on_open hook: 10.99.0.1 prompt PUN-CORE-R1#
attempt 1/3: 10.99.0.99 did not answer
attempt 2/3: 10.99.0.99 did not answer
attempt 3/3: 10.99.0.99 did not answer
giving up: 10.99.0.99 unreachable after 3 attempts
not retried: failed to authenticate to host 10.99.0.1 with username netops
before open(): connection not opened, call open() first</pre>
<p>Read the output from the top. The hook printed the prompt of R1. The dead host got three attempts and then a clear message from <i>your</i> code. The wrong password was not retried at all. And the last line shows what happens when you send a command before <code>open()</code>: <code>ScrapliConnectionNotOpened</code> again, which is why this class means "network trouble" <i>or</i> "a bug in your order of calls".</p>
<div class="note"><p><b>In the lab vs on real gear.</b> On real gear a custom <code>on_open</code> takes the place of the platform's default one, so your function must do what the default did (reach <code>privilege_exec</code>, switch paging off). The lab keeps its own session preparation and simply calls your hook afterwards. Check the documentation of your scrapli version before relying on this.</p></div>

<h3>Prompts and privilege levels</h3>
<p>scrapli reads until the prompt returns. That is how it knows a command has finished, and it is why a driver for the wrong vendor fails <b>at login</b>: it waits for a prompt that never comes. Lab 2 shows this with the Junos driver pointed at an IOS XE router. The platform drivers also model <b>privilege levels</b>: <code>exec</code>, <code>privilege_exec</code> and <code>configuration</code> on IOS XE and EOS; <code>exec</code> and <code>configuration</code> on Junos (real Junos has exclusive and private variants as well). <code>send_command</code> runs in the default level (<code>privilege_exec</code>, or <code>exec</code> on Junos), and <code>send_configs</code> moves to <code>configuration</code> and back. You can move yourself with <code>acquire_priv("configuration")</code>. On real gear, a prompt that does not follow the platform's pattern (a custom banner, a changed hostname format) is handled with <code>comms_prompt_pattern</code>; the lab ignores that argument.</p>

<div class="warn"><p><b>Common mistakes.</b> Retrying <code>ScrapliAuthenticationFailed</code> and locking the account. Raising <code>timeout_ops</code> to 300 to cure a login problem: the wrong stage. Catching bare <code>Exception</code> and hiding a <code>ScrapliTypeError</code> that is a bug. Retrying a configuration push after a <code>ScrapliTimeout</code> without checking the device state first: the change may have been applied.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>ScrapliConnectionNotOpened</code> is not only "the host is down". It is also raised for a command sent before <code>open()</code> and for a driver that cannot find its prompt.</p></div>

<div class="scn"><h4>Locked out at 02:00</h4><p>A monitoring script retried every failure three times. After a password rotation it tried the old password three times on each of 200 devices, and the AAA server locked the service account. The morning shift could not log in anywhere. The new rule: connection errors retry, authentication errors alert and stop.</p><p><b>Lesson:</b> a retry is only safe when the second attempt can behave differently from the first.</p></div>

<div class="iv"><p class="q">"What do the scrapli timeouts mean and how do you handle a dead device?"</p><p>Socket timeout for the TCP connect, transport timeout for the SSH layer, operations timeout for one command. A dead device raises <code>ScrapliConnectionNotOpened</code>; I catch it per device, log it, keep going and report it in the summary. I never retry authentication failures.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Three timeouts: <code>timeout_socket</code>, <code>timeout_transport</code>, <code>timeout_ops</code>; each guards one stage.</li>
<li>All scrapli exceptions derive from <code>ScrapliException</code>; the class tells you the cause.</li>
<li>Retry <code>ScrapliConnectionNotOpened</code> with a pause; never retry <code>ScrapliAuthenticationFailed</code>.</li>
<li>The wrong driver fails at login, because the expected prompt never comes.</li>
<li>Privilege levels are modelled; <code>send_configs</code> moves in and out of <code>configuration</code> for you.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> jo script saikdon devices se baat karti hai use aise devices milenge jo jawab nahi dete, dheere jawab dete hain, ya aisa jawab dete hain jiski driver ko ummeed nahi thi. scrapli ke paas iske liye teen timeouts, exceptions ka parivaar aur privilege levels ka model hai. Yeh jaanna ki kaun sa kaun hai, rahasya ko ek-line ke fix mein badal deta hai.</p>

<h3>Teen timeouts</h3>
`+e(t,`Har timeout alag stage ki raksha karta hai. Real gear par defaults: 15, 30 aur 30 seconds.`)+`
<table class="cmp"><tr><th>Argument</th><th>Kis ki raksha karta hai</th><th>Kab badalna hai</th></tr>
<tr><td><code>timeout_socket</code></td><td>port 22 ka TCP connection</td><td>LAN par kam karo (5 s) taaki dead devices jaldi fail ho; slow WAN par badhao</td></tr>
<tr><td><code>timeout_transport</code></td><td>SSH layer: login aur har read</td><td>slow AAA server wale devices ke liye badhao</td></tr>
<tr><td><code>timeout_ops</code></td><td>ek poora operation, jaise ek <code>send_command</code></td><td>slow commands (<code>show tech-support</code>, bada <code>show ip route</code>) ke liye badhao; ek call mein bhi <code>timeout_ops=</code> de sakte ho</td></tr></table>
<p>Teeno Lab 1 ke <code>device_params()</code> mein pehle se the (5, 10 aur 30). Timeout slow device ko tez nahi banata; woh tay karta hai ki haar maanne se pehle aap kitna intezaar karte ho.</p>
<div class="note"><p><b>Lab mein vs real gear par.</b> Lab teeno arguments accept karta hai par slow devices simulate nahi karta, isliye yahan <code>ScrapliTimeout</code> reproduce nahi kar sakte, aur lab mein intezaar ke liye asli clock nahi hai. Dead host turant <code>ScrapliConnectionNotOpened</code> ke saath fail hota hai. Real gear par wahi failure <code>timeout_socket</code> seconds leti hai, aur atki hui command <code>timeout_ops</code> seconds ke baad <code>ScrapliTimeout</code> raise karti hai.</p></div>

<h3>Exceptions ka parivaar</h3>
<table class="cmp"><tr><th>Exception</th><th>Matlab</th><th>Retry?</th></tr>
<tr><td><code>ScrapliAuthenticationFailed</code></td><td>galat user, password ya key</td><td><b>kabhi nahi</b>: baar-baar galat login accounts lock karte hain</td></tr>
<tr><td><code>ScrapliConnectionNotOpened</code></td><td>unreachable, port band, driver ko prompt nahi mila, ya <code>open()</code> se pehle command bheji</td><td>network trouble ke liye haan, code bug ke liye nahi</td></tr>
<tr><td><code>ScrapliTimeout</code></td><td>ek operation <code>timeout_ops</code> se zyada chala</td><td>sirf read-only commands ke liye</td></tr>
<tr><td><code>ScrapliModuleNotFound</code></td><td>platform naam core platform nahi hai</td><td>nahi: inventory theek karo</td></tr>
<tr><td><code>ScrapliTypeError</code>, <code>ScrapliValueError</code></td><td>galat argument type ya khaali host</td><td>nahi: code theek karo</td></tr>
<tr><td><code>ScrapliCommandFailure</code></td><td>aapne failed Response par <code>raise_for_status()</code> bulaya</td><td>nahi: output padho</td></tr>
<tr><td><code>ScrapliException</code></td><td>un sab ki base class</td><td>ise sabse aakhir mein pakdo</td></tr></table>

<h3>Network ko retry karo, password ko kabhi nahi</h3>
<p>Neeche ka retry helper niyam dikhata hai. Woh sirf <code>ScrapliConnectionNotOpened</code> retry karta hai, har baar thoda zyada rukta hai, aur <code>ScrapliAuthenticationFailed</code> ko seedha nikalne deta hai. Woh <code>on_open</code> bhi use karta hai, ek function jo scrapli login ke turant baad bulata hai.</p>
<pre class="code">import time

from scrapli import Scrapli
from scrapli.exceptions import ScrapliAuthenticationFailed, ScrapliConnectionNotOpened


def open_with_retry(params, tries=3):
    for attempt in range(1, tries + 1):
        conn = Scrapli(**params)
        try:
            conn.open()
            return conn
        except ScrapliAuthenticationFailed:
            raise
        except ScrapliConnectionNotOpened:
            print(f"attempt {attempt}/{tries}: {params['host']} did not answer")
            time.sleep(attempt)
    raise ConnectionError(f"{params['host']} unreachable after {tries} attempts")


def announce(conn):
    print(f"on_open hook: {conn.host} prompt {conn.get_prompt()}")


base = {"platform": "cisco_iosxe", "auth_username": "netops", "auth_password": "NK@2026",
        "auth_secondary": "NK@2026", "auth_strict_key": False,
        "timeout_socket": 5, "timeout_transport": 10, "timeout_ops": 30}
good = open_with_retry(dict(base, host="10.99.0.1", on_open=announce))
good.close()
try:
    open_with_retry(dict(base, host="10.99.0.99"))
except ConnectionError as err:
    print("giving up:", err)
try:
    open_with_retry(dict(base, host="10.99.0.1", auth_password="wrong"))
except ScrapliAuthenticationFailed as err:
    print("not retried:", err)

idle = Scrapli(**dict(base, host="10.99.0.1"))
try:
    idle.send_command("show clock")
except ScrapliConnectionNotOpened as err:
    print("before open():", err)</pre>
<pre class="out">AUTO01$ python3 ch6.py
on_open hook: 10.99.0.1 prompt PUN-CORE-R1#
attempt 1/3: 10.99.0.99 did not answer
attempt 2/3: 10.99.0.99 did not answer
attempt 3/3: 10.99.0.99 did not answer
giving up: 10.99.0.99 unreachable after 3 attempts
not retried: failed to authenticate to host 10.99.0.1 with username netops
before open(): connection not opened, call open() first</pre>
<p>Output ko upar se padho. Hook ne R1 ka prompt print kiya. Dead host ko teen koshishein mili aur phir <i>aapke</i> code ka saaf message. Galat password retry hua hi nahi. Aur aakhri line dikhati hai ki <code>open()</code> se pehle command bhejne par kya hota hai: phir <code>ScrapliConnectionNotOpened</code>, isliye yeh class "network trouble" <i>ya</i> "calls ke kram mein aapke code ka bug" dono ka matlab hai.</p>
<div class="note"><p><b>Lab mein vs real gear par.</b> Real gear par custom <code>on_open</code> platform ke default wale ki jagah leta hai, isliye aapka function wahi kare jo default karta tha (<code>privilege_exec</code> tak pahunchna, paging band karna). Lab apni session preparation rakhta hai aur aapka hook baad mein bulata hai. Isse par bharosa karne se pehle apne scrapli version ka documentation dekho.</p></div>

<h3>Prompts aur privilege levels</h3>
<p>scrapli prompt wapas aane tak padhta hai. Yehi use batata hai ki command khatam hui, aur yehi wajah hai ki galat vendor ka driver <b>login par hi</b> fail hota hai: woh aise prompt ka intezaar karta hai jo kabhi nahi aata. Lab 2 yeh Junos driver ko IOS XE router par laga kar dikhata hai. Platform drivers <b>privilege levels</b> ka model bhi rakhte hain: IOS XE aur EOS par <code>exec</code>, <code>privilege_exec</code> aur <code>configuration</code>; Junos par <code>exec</code> aur <code>configuration</code> (real Junos mein exclusive aur private variants bhi hain). <code>send_command</code> default level mein chalta hai (<code>privilege_exec</code>, Junos par <code>exec</code>), aur <code>send_configs</code> <code>configuration</code> mein jaata aur wapas aata hai. Aap khud <code>acquire_priv("configuration")</code> se jaa sakte ho. Real gear par platform ke pattern ko na follow karne wala prompt (custom banner, badla hua hostname format) <code>comms_prompt_pattern</code> se sambhala jaata hai; lab us argument ko ignore karta hai.</p>

<div class="warn"><p><b>Aam galtiyan.</b> <code>ScrapliAuthenticationFailed</code> retry karna aur account lock karwana. Login problem ka ilaaj karne ke liye <code>timeout_ops</code> 300 karna: galat stage. Bare <code>Exception</code> pakad kar <code>ScrapliTypeError</code> chhupana jo ek bug hai. <code>ScrapliTimeout</code> ke baad device ki state dekhe bina configuration push dobara karna: ho sakta hai change apply ho chuka ho.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>ScrapliConnectionNotOpened</code> sirf "host down hai" nahi hai. Yeh <code>open()</code> se pehle bheji command par aur uss driver par bhi raise hota hai jise apna prompt nahi milta.</p></div>

<div class="scn"><h4>Raat ke 02:00 par lock out</h4><p>Ek monitoring script har failure teen baar retry karti thi. Password rotation ke baad usne 200 devices par har ek par purana password teen baar try kiya, aur AAA server ne service account lock kar diya. Subah ki shift kahin login nahi kar paayi. Naya niyam: connection errors retry hote hain, authentication errors alert dekar ruk jaate hain.</p><p><b>Lesson:</b> retry tabhi surakshit hai jab doosri koshish pehli se alag behave kar sake.</p></div>

<div class="iv"><p class="q">"scrapli timeouts ka matlab kya hai aur dead device kaise sambhalte ho?"</p><p>TCP connect ke liye socket timeout, SSH layer ke liye transport timeout, ek command ke liye operations timeout. Dead device <code>ScrapliConnectionNotOpened</code> raise karta hai; main use har device par pakadta hoon, log karta hoon, aage badhta hoon aur summary mein report karta hoon. Authentication failures ko main kabhi retry nahi karta.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Teen timeouts: <code>timeout_socket</code>, <code>timeout_transport</code>, <code>timeout_ops</code>; har ek ek stage ki raksha karta hai.</li>
<li>Saare scrapli exceptions <code>ScrapliException</code> se nikalte hain; class wajah batati hai.</li>
<li><code>ScrapliConnectionNotOpened</code> ko pause ke saath retry karo; <code>ScrapliAuthenticationFailed</code> ko kabhi nahi.</li>
<li>Galat driver login par fail hota hai, kyunki expected prompt kabhi nahi aata.</li>
<li>Privilege levels modelled hain; <code>send_configs</code> aapke liye <code>configuration</code> mein jaata aur nikalta hai.</li>
</ul></div>
`}};export{n as default};