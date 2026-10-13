var e={id:`standalone-local-auth`,h:{en:`Standalone mode, local authentication and backup RADIUS`,hi:`Standalone mode, local authentication aur backup RADIUS`},body:{en:`
<p>Back to the franchise shop. The phone line to Mumbai is cut at 11:00. A good manager keeps selling what he can sell alone: cash sales, regular customers on his own price list. He cannot sell items that need head office approval. <b>Standalone mode</b> is exactly that: the AP has lost its controller and serves what needs nothing from the controller.</p>

<h3>When does an AP go standalone?</h3>
<ul>
<li>The WAN or the controller is down: CAPWAP echo times out.</li>
<li>In the model, a <b>native VLAN mismatch</b> between the flex profile and the switch port (chapter 5).</li>
</ul>
<p>The AP is still a member of the site; it just cannot reach the controller. When the path comes back, it rejoins and logs that it left standalone mode.</p>
<pre class="out">WLC1# show logging
<span class="hl">%CAPWAP-3-AP_LOST: AP AP-PUN1 (00:50:79:66:68:11) disassociated: CAPWAP echo timeout, controller 10.10.99.10 unreachable (WAN or controller down) (FlexConnect AP keeps serving locally switched WLANs)</span>

WLC1# show ap summary
Number of APs: 1
AP Name              Slots AP Model      Ethernet MAC     Radio MAC        CC  IP Address       State
AP1                  2     C9120AXI-D    0050.7966.6801   ...              IN  10.10.10.21      Registered</pre>
<p>The controller hides the standalone APs from <code>show ap summary</code>, <code>show ap tag summary</code> and the client lists. A branch outage looks like "two APs disappeared", although the clients may be perfectly happy. Do not assume the Wi-Fi is down because the AP is missing from the controller.</p>

<h3>What survives</h3>
<table class="cmp">
<tr><th>WLAN type</th><th>In standalone mode</th></tr>
<tr><td>Local switching, PSK or open</td><td>served; new clients join, DHCP from branch</td></tr>
<tr><td>Local switching, 802.1X, central auth</td><td>not served in the lab (no way to reach RADIUS through the controller)</td></tr>
<tr><td>Local switching, 802.1X, local auth</td><td>served if the AP can reach the branch RADIUS</td></tr>
<tr><td>Central switching</td><td>not served (no tunnel)</td></tr>
<tr><td>Central association</td><td>not served</td></tr>
</table>
<p>On real equipment, clients that were already authenticated on a locally switched WLAN usually stay connected while new 802.1X clients cannot join. The lab shows the simpler rule: no local authentication, no service.</p>

<h3>Local authentication in four steps</h3>
<ol>
<li><b>Define the server and group</b> on the controller (the AP will reuse them).</li>
<li><b>Point the flex profile</b> at the group: <code>local-auth radius-server-group</code>.</li>
<li><b>Tell the policy profile</b> not to authenticate centrally: <code>no central authentication</code> (shut the profile first).</li>
<li><b>Register the APs on the branch RADIUS server</b> as clients (NAS), with the shared key.</li>
</ol>
<pre class="code"><span class="c">! lab 4, on WLC1</span>
radius server RAD-PUN
 address ipv4 10.30.60.20 auth-port 1812 acct-port 1813
 key 0 NkRadius1
 exit
aaa group server radius RG-PUN
 server name RAD-PUN
 exit
wireless profile flex FLEX-PUNE
 local-auth radius-server-group RG-PUN
 exit
wireless profile policy PP-CORP-PUN
 shutdown
 no central authentication
 no shutdown
 exit</pre>
<pre class="code"><span class="c">! lab 4, on RAD-PUN (the AP addresses come from show ap summary)</span>
aaa-server client 10.30.10.11 key NkRadius1
aaa-server client 10.30.10.12 key NkRadius1</pre>
<p>Web UI: the group is under <b>Configuration &gt; Security &gt; AAA</b> (Servers and Server Groups tabs), the link in the flex profile is under <b>Configuration &gt; Tags &amp; Profiles &gt; Flex</b> (Local Authentication). The <code>no central authentication</code> switch is CLI only in this web UI.</p>
<div class="note"><p><b>Confirm on your release.</b> <code>no central authentication</code> as the policy knob is the form this module uses; the exact name and place of the local authentication setting differs between 9800 software releases (and real flex profiles also offer local EAP users on the AP for LEAP and EAP-FAST, concept only here). Check the configuration guide of your IOS XE version before copying it into production.</p></div>

<h3>The big change: the AP becomes the RADIUS client</h3>
<p>With central authentication, RADIUS sees one client: the controller. With local authentication, the <b>AP</b> sends the RADIUS request, with the AP address as source. So RAD-PUN needs a client entry for <b>every Pune AP</b>. Three failure modes, all visible on the RADIUS server:</p>
<pre class="out">RAD-PUN# aaa-server show log
RADIUS request from 10.30.10.12 ignored: <span class="hl">unknown network device</span>
RADIUS request from 10.30.10.12 ignored: <span class="hl">shared key mismatch</span>
802.1X authentication FAIL for alice (NAS 10.30.10.12, FlexConnect AP): <span class="hl">wrong password</span></pre>
<ul>
<li>No client entry: the server drops the request silently; the user sees a timeout.</li>
<li>Wrong key: the same, an ignored request.</li>
<li>Wrong password: a real <b>Access-Reject</b>, the only case where the server answers with an error.</li>
</ul>
<p>The client side of the lab shows the success path:</p>
<pre class="out">LAPTOP3# wifi connect NK-CORP user alice password NkWifi@2024
Found "NK-CORP" on AP-PUN2 (5 GHz, channel 36, -48 dBm)
802.1X/EAP: sending identity "alice" (the AP relays EAP to the RADIUS server group RG-PUN of flex profile FLEX-PUNE: local authentication)
<span class="hl">RADIUS Access-Accept from 10.30.60.20 (answered to the AP)</span> - PMK installed, 4-way handshake ... completed</pre>

<h3>Backup RADIUS</h3>
<p>A server group can hold several servers; the AP tries them in order, so list the branch server first and a second server (a neighbouring site or a branch standby) after it. Whether a given release supports a separate backup server list inside the flex profile, or only the group, is something to confirm on your version. The design rule stands: at least one RADIUS server reachable without the WAN.</p>

<div class="eg"><p><b>Worked example.</b> Before the lab fix: WAN cut, LAPTOP2 on NK-STAFF (PSK) keeps working, GUEST2 on NK-GUEST is gone, LAPTOP3 cannot join NK-CORP. After the four steps: the same cut, LAPTOP3 joins NK-CORP as alice, gets 10.30.20.x and VLAN 220. The WAN is still dead; RAD-PUN answered the AP.</p></div>

<div class="warn"><p><b>Common mistake.</b> Registering only the controller as a client of RAD-PUN. Local authentication then fails in the one situation it exists for. Also do not forget that APs get new addresses after replacement; the RADIUS client list must follow.</p></div>

<div class="exam"><p><b>Exam trap.</b> Standalone mode is not the same as "the AP is down". The AP still serves clients. And local authentication needs both pieces: the flex profile group and the policy profile setting.</p></div>

<div class="scn"><h4>Friday cable cut</h4><p>A contractor cut the provider fibre to a Pune office on a Friday afternoon. The NOC saw both Pune APs vanish from the controller and escalated. A phone call to the branch revealed that staff on the PSK network were working normally, and corporate laptops had joined with 802.1X through the branch RADIUS server all along. The only users who lost service were guests, as designed.</p><p><b>Lesson:</b> a missing AP on the controller does not mean missing Wi-Fi; check what the standalone design promised.</p></div>

<div class="iv"><p class="q">"Corporate users in a branch cannot connect after a WAN failure. What did the design miss?"</p><p>Authentication is still central. Configure local authentication: a RADIUS server group with a branch server in the flex profile, <code>no central authentication</code> in the policy profile, and register every AP as a RADIUS client with the right key.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Standalone mode keeps locally switched WLANs that need nothing from the controller.</li>
<li>Central switching, central association and central authentication stop.</li>
<li>Local authentication: server group, flex profile link, <code>no central authentication</code>, AP clients on RADIUS.</li>
<li>The AP address is the RADIUS source, so each AP needs a client entry and the key.</li>
<li>The controller hides standalone APs; confirm release-specific settings in the guide.</li>
</ul></div>
`,hi:`
<p>Wapas franchise shop par. Mumbai ki phone line subah 11:00 baje kat gayi. Achha manager woh bechta rehta hai jo woh akela bech sakta hai: cash sales, apni price list par regular customers. Jin items ko head office ki approval chahiye woh nahi bech sakta. <b>Standalone mode</b> bilkul yahi hai: AP apna controller kho chuka hai aur woh serve karta hai jise controller se kuch nahi chahiye.</p>

<h3>AP standalone kab hota hai?</h3>
<ul>
<li>WAN ya controller down hai: CAPWAP echo timeout.</li>
<li>Model mein, flex profile aur switch port ke beech <b>native VLAN mismatch</b> (chapter 5).</li>
</ul>
<p>AP abhi bhi site ka member hai; bas controller tak nahi pahunch pata. Path wapas aate hi woh rejoin karta hai aur log karta hai ki standalone mode se bahar aaya.</p>
<pre class="out">WLC1# show logging
<span class="hl">%CAPWAP-3-AP_LOST: AP AP-PUN1 (00:50:79:66:68:11) disassociated: CAPWAP echo timeout, controller 10.10.99.10 unreachable (WAN or controller down) (FlexConnect AP keeps serving locally switched WLANs)</span>

WLC1# show ap summary
Number of APs: 1
AP Name              Slots AP Model      Ethernet MAC     Radio MAC        CC  IP Address       State
AP1                  2     C9120AXI-D    0050.7966.6801   ...              IN  10.10.10.21      Registered</pre>
<p>Controller standalone APs ko <code>show ap summary</code>, <code>show ap tag summary</code> aur client lists se chhupa deta hai. Branch outage "do APs gayab ho gaye" jaisa dikhta hai, jabki clients bilkul khush ho sakte hain. AP controller mein nahi dikh raha to yeh mat maano ki Wi-Fi down hai.</p>

<h3>Kya bachta hai</h3>
<table class="cmp">
<tr><th>WLAN type</th><th>Standalone mode mein</th></tr>
<tr><td>Local switching, PSK ya open</td><td>serve hota hai; naye clients join, DHCP branch se</td></tr>
<tr><td>Local switching, 802.1X, central auth</td><td>lab mein serve nahi (controller ke through RADIUS tak jaane ka raasta nahi)</td></tr>
<tr><td>Local switching, 802.1X, local auth</td><td>serve hota hai agar AP branch RADIUS tak pahunch sake</td></tr>
<tr><td>Central switching</td><td>serve nahi (tunnel nahi)</td></tr>
<tr><td>Central association</td><td>serve nahi</td></tr>
</table>
<p>Asli equipment par, jo clients locally switched WLAN par pehle se authenticated the woh aam taur par connected rehte hain jabki naye 802.1X clients join nahi kar sakte. Lab simple rule dikhata hai: local authentication nahi, to service nahi.</p>

<h3>Local authentication chaar steps mein</h3>
<ol>
<li><b>Server aur group define karo</b> controller par (AP unhe reuse karega).</li>
<li><b>Flex profile ko group par point karo</b>: <code>local-auth radius-server-group</code>.</li>
<li><b>Policy profile ko batao</b> ki centrally authenticate na kare: <code>no central authentication</code> (pehle profile shut).</li>
<li><b>APs ko branch RADIUS server par register karo</b> clients (NAS) ke roop mein, shared key ke saath.</li>
</ol>
<pre class="code"><span class="c">! lab 4, WLC1 par</span>
radius server RAD-PUN
 address ipv4 10.30.60.20 auth-port 1812 acct-port 1813
 key 0 NkRadius1
 exit
aaa group server radius RG-PUN
 server name RAD-PUN
 exit
wireless profile flex FLEX-PUNE
 local-auth radius-server-group RG-PUN
 exit
wireless profile policy PP-CORP-PUN
 shutdown
 no central authentication
 no shutdown
 exit</pre>
<pre class="code"><span class="c">! lab 4, RAD-PUN par (AP addresses show ap summary se aate hain)</span>
aaa-server client 10.30.10.11 key NkRadius1
aaa-server client 10.30.10.12 key NkRadius1</pre>
<p>Web UI: group <b>Configuration &gt; Security &gt; AAA</b> (Servers aur Server Groups tabs) mein hai, flex profile mein link <b>Configuration &gt; Tags &amp; Profiles &gt; Flex</b> (Local Authentication) mein hai. <code>no central authentication</code> switch is web UI mein sirf CLI se hota hai.</p>
<div class="note"><p><b>Apne release par confirm karo.</b> Policy knob ke roop mein <code>no central authentication</code> woh form hai jo yeh module use karta hai; local authentication setting ka exact naam aur jagah 9800 software releases ke beech alag hoti hai (aur asli flex profiles AP par LEAP aur EAP-FAST ke liye local EAP users bhi dete hain, yahan concept only). Production mein copy karne se pehle apne IOS XE version ki configuration guide dekho.</p></div>

<h3>Bada badlav: AP RADIUS client ban jata hai</h3>
<p>Central authentication mein RADIUS ko ek client dikhta hai: controller. Local authentication mein <b>AP</b> RADIUS request bhejta hai, AP address source ke saath. Isliye RAD-PUN ko <b>har Pune AP</b> ki client entry chahiye. Teen failure modes, sab RADIUS server par dikhte hain:</p>
<pre class="out">RAD-PUN# aaa-server show log
RADIUS request from 10.30.10.12 ignored: <span class="hl">unknown network device</span>
RADIUS request from 10.30.10.12 ignored: <span class="hl">shared key mismatch</span>
802.1X authentication FAIL for alice (NAS 10.30.10.12, FlexConnect AP): <span class="hl">wrong password</span></pre>
<ul>
<li>Client entry nahi: server request chupchap drop karta hai; user ko timeout dikhta hai.</li>
<li>Galat key: wahi, ignored request.</li>
<li>Galat password: asli <b>Access-Reject</b>, ek hi case jahan server error ke saath jawab deta hai.</li>
</ul>
<p>Lab ka client side success path dikhata hai:</p>
<pre class="out">LAPTOP3# wifi connect NK-CORP user alice password NkWifi@2024
Found "NK-CORP" on AP-PUN2 (5 GHz, channel 36, -48 dBm)
802.1X/EAP: sending identity "alice" (the AP relays EAP to the RADIUS server group RG-PUN of flex profile FLEX-PUNE: local authentication)
<span class="hl">RADIUS Access-Accept from 10.30.60.20 (answered to the AP)</span> - PMK installed, 4-way handshake ... completed</pre>

<h3>Backup RADIUS</h3>
<p>Server group mein kai servers ho sakte hain; AP unhe order mein try karta hai, isliye branch server pehle likho aur doosra server (paas ki site ya branch standby) uske baad. Kisi release mein flex profile ke andar alag backup server list support hai ya sirf group, yeh apne version par confirm karne wali baat hai. Design rule wahi: kam se kam ek RADIUS server jo WAN ke bina reachable ho.</p>

<div class="eg"><p><b>Worked example.</b> Lab fix se pehle: WAN cut, NK-STAFF (PSK) par LAPTOP2 chalta rehta hai, NK-GUEST par GUEST2 gayab, LAPTOP3 NK-CORP join nahi kar sakta. Chaar steps ke baad: wahi cut, LAPTOP3 alice ke roop mein NK-CORP join karta hai, 10.30.20.x aur VLAN 220 paata hai. WAN abhi bhi mari hui hai; RAD-PUN ne AP ko jawab diya.</p></div>

<div class="warn"><p><b>Common mistake.</b> RAD-PUN par sirf controller ko client register karna. Tab local authentication usi ek situation mein fail hota hai jiske liye woh bana hai. Yeh bhi mat bhoolo ki replacement par APs ko naye addresses milte hain; RADIUS client list ko follow karna padega.</p></div>

<div class="exam"><p><b>Exam trap.</b> Standalone mode "AP down hai" ke barabar nahi hai. AP abhi bhi clients serve karta hai. Aur local authentication ke dono hisse chahiye: flex profile group aur policy profile setting.</p></div>

<div class="scn"><h4>Friday ka cable cut</h4><p>Ek contractor ne Friday dopahar Pune office ka provider fibre kaat diya. NOC ne dono Pune APs ko controller se gayab hote dekha aur escalate kiya. Branch ko phone karne par pata chala ki PSK network par staff normally kaam kar raha tha, aur corporate laptops branch RADIUS server ke through 802.1X se shuru se join the. Sirf guests ki service gayi, jaisa design tha.</p><p><b>Lesson:</b> controller par AP ka na dikhna matlab Wi-Fi ka na hona nahi hai; check karo standalone design ne kya promise kiya tha.</p></div>

<div class="iv"><p class="q">"WAN failure ke baad branch ke corporate users connect nahi ho paate. Design mein kya chhoot gaya?"</p><p>Authentication abhi bhi central hai. Local authentication configure karo: flex profile mein branch server wala RADIUS server group, policy profile mein <code>no central authentication</code>, aur har AP ko sahi key ke saath RADIUS client register karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Standalone mode un locally switched WLANs ko rakhta hai jinhe controller se kuch nahi chahiye.</li>
<li>Central switching, central association aur central authentication ruk jaate hain.</li>
<li>Local authentication: server group, flex profile link, <code>no central authentication</code>, RADIUS par AP clients.</li>
<li>AP address RADIUS source hai, isliye har AP ko client entry aur key chahiye.</li>
<li>Controller standalone APs chhupata hai; release-specific settings guide mein confirm karo.</li>
</ul></div>
`}};export{e as default};