var e={id:`serviceability-and-cli`,h:{en:`Serviceability functions and the documented Panorama CLI`,hi:`Serviceability functions aur documented Panorama CLI`},body:{en:`
<p>A mechanic has two toolboxes. One is the car's built-in diagnostic port that gives you named readouts: "fuel system status", "brake pad wear". The other is a set of hand tools for the parts you can reach: spanners and screwdrivers. In Prisma Access, the built-in readouts are the <b>serviceability functions</b> that the console offers for the cloud side. The hand tools are the <b>CLI commands</b> you run on Panorama and on your own branch and HQ firewalls. This chapter is honest about what is documented and what is not, because an exam answer or a production command built on a guess can cause damage.</p>

<h3>Serviceability: functions, not syntax</h3>
<p>The documentation page "Use Serviceability Commands for Troubleshooting" names what the functions do, but it does not give CLI syntax for them. Learn them as functions:</p>
<table class="cmp">
<tr><th>Function</th><th>What it gives you</th><th>Use it when</th></tr>
<tr><td>Logging Status</td><td>Whether the logging connection to the Strata Logging Service is healthy</td><td>Logs are missing</td></tr>
<tr><td>Routing Information</td><td>Destination, Nexthop, Metric/AD and Flags for a service connection or remote network</td><td>Return path or missing route questions</td></tr>
<tr><td>Clear IPSec SA (Clear Security Associations)</td><td>Resets the IPsec security association</td><td>After you edited crypto settings</td></tr>
<tr><td>EDL Info, Status, Refresh, Search EDL</td><td>Information on external dynamic lists, refresh and lookup</td><td>A list-based block or allow seems stale</td></tr>
<tr><td>Service IP Address</td><td>The service IP addresses of the tenant</td><td>Allow-listing or peer address questions</td></tr>
</table>
<div class="note"><p><b>Do not invent syntax.</b> If a question or colleague asks for "the CLI for Routing Information", the honest answer is that the documentation names the function. Use the console or the documented method for your release, and say so.</p></div>

<h3>The documented Panorama CLI</h3>
<p>A Palo Alto Networks knowledge-base article lists these Panorama commands for the Cloud Services plugin. They are the forms as given; nothing else should be added.</p>
<pre class="code"><span class="c"># Licence information on Panorama</span>
request license info
request license fetch

<span class="c"># Certificate used between Panorama and the service</span>
request plugins cloud_services panorama-certificate delete
request plugins cloud_services panorama-certificate fetch otp &lt;OTP_KEY&gt;

<span class="c"># Connectivity and logging checks</span>
debug plugins cloud_services prisma-access echo-test
request plugins cloud_services logging-service status

<span class="c"># Let other commits proceed while blocking Prisma Access pushes</span>
set plugins cloud_services panorama-offline yes
set plugins cloud_services panorama-offline no</pre>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="CLI map">
<rect x="20" y="20" width="180" height="50" rx="8" fill="#bae6fd"/><text x="110" y="50" text-anchor="middle" class="svg-ink" font-size="13">License commands</text>
<rect x="230" y="20" width="180" height="50" rx="8" fill="#ddd6fe"/><text x="320" y="50" text-anchor="middle" class="svg-ink" font-size="13">Certificate + OTP</text>
<rect x="440" y="20" width="180" height="50" rx="8" fill="#bbf7d0"/><text x="530" y="50" text-anchor="middle" class="svg-ink" font-size="13">echo-test, logging status</text>
<rect x="125" y="120" width="390" height="50" rx="8" fill="#fde68a"/><text x="320" y="150" text-anchor="middle" class="svg-ink" font-size="13">panorama-offline yes or no (pushes blocked)</text>
<line x1="110" y1="70" x2="250" y2="120" stroke="#64748b" stroke-width="2" stroke-dasharray="4 3"/><line x1="320" y1="70" x2="320" y2="120" stroke="#64748b" stroke-width="2" stroke-dasharray="4 3"/><line x1="530" y1="70" x2="390" y2="120" stroke="#64748b" stroke-width="2" stroke-dasharray="4 3"/>
</svg><p class="cap">Four groups: licence, certificate, checks, offline switch.</p></div>

<h3>What each command is for</h3>
<ul>
<li><b>request license info</b> shows the licence state; <b>request license fetch</b> asks for it again after a change.</li>
<li><b>panorama-certificate delete</b> and <b>panorama-certificate fetch otp</b> remove and re-fetch the certificate Panorama uses to talk to the service. The OTP (one-time password) is generated in Common Services during licence activation. Treat it like a secret: do not paste it in a ticket or chat.</li>
<li><b>prisma-access echo-test</b> checks that Panorama can reach the Prisma Access service.</li>
<li><b>logging-service status</b> shows the logging connection state.</li>
<li><b>panorama-offline</b> is a deliberate switch. With yes, other commits proceed but Prisma Access pushes are blocked. Always set it back to no and record the time.</li>
</ul>
<p>No documented CLI form for commit or push was found, so use the GUI paths from earlier chapters.</p>

<h3>Branch and HQ PAN-OS firewall commands</h3>
<p>Tunnels have two ends, and the ends you own are PAN-OS firewalls (BR-FW at 198.51.100.10 and HQ-FW at 192.0.2.10 in the lab). The PAN-OS guide for troubleshooting site-to-site VPN gives these:</p>
<pre class="code">show vpn ike-sa
show vpn ipsec-sa
show vpn tunnel
show vpn gateway
show vpn flow
test vpn ike-sa gateway &lt;gw&gt;
test vpn ipsec-sa tunnel &lt;t&gt;
clear vpn ike-sa gateway &lt;gw&gt;
clear vpn ipsec-sa tunnel &lt;t&gt;</pre>
<p>Use <b>show</b> first, <b>test</b> to prompt negotiation, and <b>clear</b> only when you accept a brief outage on that tunnel (for example after correcting crypto settings). The guide also describes debugging aids (debug ike global on, ikemgr log, ike pcap), which are more intrusive; use them with a change approval and turn them off afterwards.</p>

<div class="eg"><p><b>Worked example.</b> A branch tunnel is down after a crypto edit. On BR-FW: <code>show vpn ike-sa</code> shows no SA. The engineer compares the IKE crypto profile (IKEv2, AES-256-CBC, SHA256, DH14) with the Prisma Access side from the push, corrects BR-FW, runs <code>test vpn ike-sa gateway</code> for the gateway, and sees an SA. She then uses the Clear IPSec SA function on the cloud side so both ends renegotiate, and Monitor, Remote Networks shows Tunnel Status up. Finally <code>show vpn ipsec-sa</code> confirms the IPsec SA.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Making up syntax for serviceability functions; leaving panorama-offline set to yes; pasting the OTP into a ticket; running clear commands during peak hours without a change record; debugging with show commands on only one end of the tunnel.</p></div>
<div class="exam"><p><b>Exam trap.</b> The serviceability page lists functions (Logging Status, Routing Information, Clear IPSec SA, EDL tools, Service IP Address). If an option shows a made-up CLI for them, be suspicious. The only Panorama CLI forms in the sources are the plugin commands above. The Panorama push is a GUI action.</p></div>

<div class="scn"><h4>The commit that would not push</h4><p>During an internet outage at HQ, an admin needed to commit an unrelated Panorama change. Commits kept failing because the plugin could not reach the cloud. She set panorama-offline to yes, committed the change, and when the link returned set it back to no and ran Commit and Push. Without the reset, every later push would have stayed blocked.</p><p><b>Lesson:</b> a switch that blocks pushes must be reversed and recorded.</p></div>

<div class="iv"><p class="q">"What CLI do you use on Panorama for Prisma Access?"</p><p>The documented plugin commands: licence info and fetch, panorama-certificate delete and fetch with an OTP, prisma-access echo-test, logging-service status, and panorama-offline yes or no. Add that serviceability tools are functions in the console, and that pushes are done through the GUI.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Serviceability is a set of functions: Logging Status, Routing Information, Clear IPSec SA, EDL tools, Service IP Address.</li>
<li>The documented Panorama CLI covers licence, certificate and OTP, echo-test, logging status and panorama-offline.</li>
<li>No documented CLI for commit or push; use the GUI.</li>
<li>Branch and HQ checks use show vpn ike-sa, ipsec-sa and tunnel; clear only with a plan.</li>
<li>Protect the OTP and always reverse panorama-offline.</li>
</ul></div>
`,hi:`
<p>Mechanic ke paas do toolboxes hote hain. Ek car ka built-in diagnostic port hai jo named readouts deta hai: "fuel system status", "brake pad wear". Doosra hand tools ka set hai un parts ke liye jinhe aap pahunch sakte ho: spanner aur screwdriver. Prisma Access mein built-in readouts wo <b>serviceability functions</b> hain jo console cloud side ke liye deta hai. Hand tools wo <b>CLI commands</b> hain jo aap Panorama aur apne branch tatha HQ firewalls par chalate ho. Ye chapter honest hai ki kya documented hai aur kya nahi, kyunki andaze par bana exam answer ya production command nuksan kar sakta hai.</p>

<h3>Serviceability: functions, syntax nahi</h3>
<p>"Use Serviceability Commands for Troubleshooting" page batata hai functions kya karte hain, lekin unka CLI syntax nahi deta. Inhe functions ki tarah seekho:</p>
<table class="cmp">
<tr><th>Function</th><th>Kya deta hai</th><th>Kab use karein</th></tr>
<tr><td>Logging Status</td><td>Strata Logging Service ka logging connection healthy hai ya nahi</td><td>Logs missing hain</td></tr>
<tr><td>Routing Information</td><td>Service connection ya remote network ke liye Destination, Nexthop, Metric/AD aur Flags</td><td>Return path ya missing route ke sawal</td></tr>
<tr><td>Clear IPSec SA (Clear Security Associations)</td><td>IPsec security association reset karta hai</td><td>Crypto settings edit karne ke baad</td></tr>
<tr><td>EDL Info, Status, Refresh, Search EDL</td><td>External dynamic lists ki information, refresh aur lookup</td><td>List-based block ya allow stale lagta hai</td></tr>
<tr><td>Service IP Address</td><td>Tenant ke service IP addresses</td><td>Allow-listing ya peer address ke sawal</td></tr>
</table>
<div class="note"><p><b>Syntax invent mat karo.</b> Koi "Routing Information ka CLI" maange to honest jawab hai ki documentation function ka naam deti hai. Console ya apni release ka documented method use karo, aur ye kaho.</p></div>

<h3>Documented Panorama CLI</h3>
<p>Palo Alto Networks ka ek knowledge-base article Cloud Services plugin ke liye ye Panorama commands list karta hai. Ye diye gaye forms hain; inme kuch aur mat jodo.</p>
<pre class="code"><span class="c"># Panorama par licence information</span>
request license info
request license fetch

<span class="c"># Panorama aur service ke beech use hone wala certificate</span>
request plugins cloud_services panorama-certificate delete
request plugins cloud_services panorama-certificate fetch otp &lt;OTP_KEY&gt;

<span class="c"># Connectivity aur logging checks</span>
debug plugins cloud_services prisma-access echo-test
request plugins cloud_services logging-service status

<span class="c"># Baaki commits chalne do, Prisma Access pushes block karo</span>
set plugins cloud_services panorama-offline yes
set plugins cloud_services panorama-offline no</pre>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="CLI map">
<rect x="20" y="20" width="180" height="50" rx="8" fill="#bae6fd"/><text x="110" y="50" text-anchor="middle" class="svg-ink" font-size="13">License commands</text>
<rect x="230" y="20" width="180" height="50" rx="8" fill="#ddd6fe"/><text x="320" y="50" text-anchor="middle" class="svg-ink" font-size="13">Certificate + OTP</text>
<rect x="440" y="20" width="180" height="50" rx="8" fill="#bbf7d0"/><text x="530" y="50" text-anchor="middle" class="svg-ink" font-size="13">echo-test, logging status</text>
<rect x="125" y="120" width="390" height="50" rx="8" fill="#fde68a"/><text x="320" y="150" text-anchor="middle" class="svg-ink" font-size="13">panorama-offline yes ya no (pushes blocked)</text>
<line x1="110" y1="70" x2="250" y2="120" stroke="#64748b" stroke-width="2" stroke-dasharray="4 3"/><line x1="320" y1="70" x2="320" y2="120" stroke="#64748b" stroke-width="2" stroke-dasharray="4 3"/><line x1="530" y1="70" x2="390" y2="120" stroke="#64748b" stroke-width="2" stroke-dasharray="4 3"/>
</svg><p class="cap">Chaar groups: licence, certificate, checks, offline switch.</p></div>

<h3>Har command kis liye hai</h3>
<ul>
<li><b>request license info</b> licence state dikhata hai; <b>request license fetch</b> change ke baad use dobara mangta hai.</li>
<li><b>panorama-certificate delete</b> aur <b>panorama-certificate fetch otp</b> wo certificate hata aur dobara fetch karte hain jo Panorama service se baat karne ke liye use karta hai. OTP (one-time password) licence activation ke dauran Common Services mein generate hota hai. Ise secret maano: ticket ya chat mein paste mat karo.</li>
<li><b>prisma-access echo-test</b> check karta hai ki Panorama Prisma Access service tak pahunch sakta hai.</li>
<li><b>logging-service status</b> logging connection state dikhata hai.</li>
<li><b>panorama-offline</b> ek jaan-boojh kar use hone wala switch hai. Yes ke saath baaki commits chalte hain lekin Prisma Access pushes block rehte hain. Hamesha wapas no karo aur time record karo.</li>
</ul>
<p>Commit ya push ka koi documented CLI form nahi mila, isliye pehle chapters ke GUI paths use karo.</p>

<h3>Branch aur HQ PAN-OS firewall commands</h3>
<p>Tunnels ke do ends hote hain, aur jo ends aapke hain wo PAN-OS firewalls hain (lab mein BR-FW 198.51.100.10 aur HQ-FW 192.0.2.10). Site-to-site VPN troubleshooting ka PAN-OS guide ye deta hai:</p>
<pre class="code">show vpn ike-sa
show vpn ipsec-sa
show vpn tunnel
show vpn gateway
show vpn flow
test vpn ike-sa gateway &lt;gw&gt;
test vpn ipsec-sa tunnel &lt;t&gt;
clear vpn ike-sa gateway &lt;gw&gt;
clear vpn ipsec-sa tunnel &lt;t&gt;</pre>
<p>Pehle <b>show</b> use karo, negotiation prompt karne ke liye <b>test</b>, aur <b>clear</b> sirf tab jab us tunnel par chhote outage ko aap accept karte ho (jaise crypto settings sahi karne ke baad). Guide debugging aids bhi batata hai (debug ike global on, ikemgr log, ike pcap), jo zyada intrusive hain; change approval ke saath use karo aur baad mein off karo.</p>

<div class="eg"><p><b>Worked example.</b> Crypto edit ke baad branch tunnel down hai. BR-FW par: <code>show vpn ike-sa</code> koi SA nahi dikhata. Engineer IKE crypto profile (IKEv2, AES-256-CBC, SHA256, DH14) ko push se aayi Prisma Access side se compare karti hai, BR-FW sahi karti hai, gateway ke liye <code>test vpn ike-sa gateway</code> chalati hai, aur SA dikhta hai. Phir cloud side par Clear IPSec SA function use karti hai taaki dono ends dobara negotiate karein, aur Monitor, Remote Networks Tunnel Status up dikhata hai. Aakhir mein <code>show vpn ipsec-sa</code> IPsec SA confirm karta hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Serviceability functions ka syntax banana; panorama-offline ko yes chhod dena; OTP ticket mein paste karna; peak hours mein change record ke bina clear commands chalana; tunnel ke sirf ek end par show commands se debug karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Serviceability page functions list karta hai (Logging Status, Routing Information, Clear IPSec SA, EDL tools, Service IP Address). Koi option inke liye banaya hua CLI dikhaye to shak karo. Sources mein Panorama CLI ke sirf upar ke plugin commands hain. Panorama push GUI action hai.</p></div>

<div class="scn"><h4>Commit jo push nahi hua</h4><p>HQ par internet outage ke dauran admin ko ek unrelated Panorama change commit karna tha. Commits fail ho rahe the kyunki plugin cloud tak nahi pahunch paa raha tha. Usne panorama-offline yes kiya, change commit kiya, aur link wapas aane par use no karke Commit and Push chalaya. Reset ke bina baad ke har push block rehta.</p><p><b>Lesson:</b> pushes ko block karne wala switch wapas karna aur record karna zaroori hai.</p></div>

<div class="iv"><p class="q">"Prisma Access ke liye Panorama par kaunsa CLI use karte ho?"</p><p>Documented plugin commands: licence info aur fetch, panorama-certificate delete aur fetch (OTP ke saath), prisma-access echo-test, logging-service status, aur panorama-offline yes ya no. Jodo ki serviceability tools console ke functions hain, aur pushes GUI se hote hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Serviceability functions ka set hai: Logging Status, Routing Information, Clear IPSec SA, EDL tools, Service IP Address.</li>
<li>Documented Panorama CLI licence, certificate aur OTP, echo-test, logging status aur panorama-offline cover karta hai.</li>
<li>Commit ya push ka documented CLI nahi; GUI use karo.</li>
<li>Branch aur HQ checks show vpn ike-sa, ipsec-sa aur tunnel se; clear sirf plan ke saath.</li>
<li>OTP ki hifazat karo aur panorama-offline hamesha reverse karo.</li>
</ul></div>
`}};export{e as default};