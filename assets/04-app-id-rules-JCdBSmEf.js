var e={id:`app-id-rules`,h:{en:`Writing App-ID security rules`,hi:`App-ID security rules likhna`},body:{en:`
<p>Old firewalls were like a guard who only checks door numbers: "port 443 is open, so anything may pass". But a door number says nothing about who is walking through. App-ID is a guard who looks at the person: "this is a web browsing session", "this is a file upload to a storage service". Palo Alto Networks calls this <b>App-ID</b>: the traffic is identified by what it really is, even when it uses a common port. Your rules name the application, so your policy says what you actually mean.</p>

<h3>Anatomy of a security rule</h3>
<table class="cmp">
<tr><th>Field</th><th>What it answers</th><th>Good practice</th></tr>
<tr><td>Name</td><td>What is this rule for?</td><td>Describe intent: <code>allow-mobile-to-hq-app</code>.</td></tr>
<tr><td>Source zone, source address</td><td>Where does the flow come from?</td><td>Use the zone and a named address object, never "any" when you know better.</td></tr>
<tr><td>Source user, HIP</td><td>Who and which device state?</td><td>Next chapters.</td></tr>
<tr><td>Destination zone, destination address</td><td>Where is it going?</td><td>Trust for the data centre, untrust for the internet.</td></tr>
<tr><td>Application</td><td>What is it really?</td><td>List only the applications you need.</td></tr>
<tr><td>Service</td><td>Which ports?</td><td>Application default is the safe choice.</td></tr>
<tr><td>Action</td><td>Allow or deny</td><td>Deny by default at the bottom.</td></tr>
<tr><td>Profile group</td><td>Deep inspection</td><td>Attach to every allow rule.</td></tr>
<tr><td>Log setting</td><td>Where do records go?</td><td>Log at session end, attach a log forwarding profile.</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Rule match">
<rect x="10" y="20" width="95" height="50" rx="8" fill="#bae6fd"/><text x="57" y="50" text-anchor="middle" class="svg-ink" font-size="12">Source zone</text>
<rect x="115" y="20" width="95" height="50" rx="8" fill="#bae6fd"/><text x="162" y="50" text-anchor="middle" class="svg-ink" font-size="12">Source user</text>
<rect x="220" y="20" width="95" height="50" rx="8" fill="#bae6fd"/><text x="267" y="50" text-anchor="middle" class="svg-ink" font-size="12">Dest zone</text>
<rect x="325" y="20" width="95" height="50" rx="8" fill="#bae6fd"/><text x="372" y="50" text-anchor="middle" class="svg-ink" font-size="12">Dest address</text>
<rect x="430" y="20" width="95" height="50" rx="8" fill="#ddd6fe"/><text x="477" y="50" text-anchor="middle" class="svg-ink" font-size="12">Application</text>
<rect x="535" y="20" width="95" height="50" rx="8" fill="#ddd6fe"/><text x="582" y="50" text-anchor="middle" class="svg-ink" font-size="12">Service</text>
<text x="320" y="105" text-anchor="middle" class="svg-muted" font-size="12">All fields must match, then the action and profiles apply</text>
<rect x="215" y="120" width="100" height="36" rx="8" fill="#bbf7d0"/><text x="265" y="143" text-anchor="middle" class="svg-ink" font-size="13">Allow</text>
<rect x="325" y="120" width="100" height="36" rx="8" fill="#fed7aa"/><text x="375" y="143" text-anchor="middle" class="svg-ink" font-size="13">Deny</text>
</svg><p class="cap">A rule matches only when every field matches. The first rule that matches decides.</p></div>

<h3>Application default</h3>
<p>When the service is <b>application-default</b>, Prisma Access allows the application only on the ports that application normally uses. This blocks a common trick: a disallowed application hiding on an allowed port. Leaving the service as "any" lets the application run on any port, which is rarely what you want.</p>

<h3>Worked example: first rules of the lab</h3>
<div class="eg"><p>Goal: let mobile users (pool 10.200.0.0/23) open the HQ app at 10.10.0.50, and nothing else in the data centre. Create an address object <code>hq-app</code> for 10.10.0.50, then two rules in order.</p></div>
<pre class="code"><span class="c"># Rule 1 (teaching format of the rule form)</span>
Name:               allow-mobile-to-hq-app
Source zone:        mobile users zone (as mapped in your tenant)
Source address:     10.200.0.0/23
Destination zone:   trust
Destination addr:   hq-app (10.10.0.50)
Application:        ssl, web-browsing
Service:            application-default
Action:             allow
Profile group:      corp-standard
Log:                at session end, forward via corp-logs

<span class="c"># Rule 2, placed below Rule 1</span>
Name:               deny-other-internal
Destination zone:   trust
Application:        any
Action:             deny
Log:                at session end</pre>
<p>Rule 2 is intentionally narrow in what it blocks (internal destinations only) and wide in who it applies to. It makes "other internal destination denied" a deliberate decision, visible in the logs, instead of an accident.</p>

<h3>What the result looks like</h3>
<pre class="out">Time      Src IP        Dst IP       App      Rule                     Action
11:02:14  10.200.0.7    10.10.0.50   ssl      <span class="hl">allow-mobile-to-hq-app</span>   allow
11:02:40  10.200.0.7    10.10.0.99   ssl      <span class="hl">deny-other-internal</span>      deny</pre>
<p>The rule name column is the first thing you read in every policy ticket. It tells you which line decided.</p>

<h3>First-packet and application shift</h3>
<p>App-ID may need a few packets to identify an application. At the start of a session the firewall may match a rule using a generic application, and the application can change later (for example from ssl to a more specific one). Rules that allow the more specific application should therefore also be written with the generic one the session starts as, if the documentation of the application requires it. When a session seems to match a different rule than expected, look at the application column in the log and at how it changed.</p>

<div class="warn"><p><b>Common mistakes.</b> Application "any" with service "any" in an allow rule; opening a whole port instead of naming the application; forgetting to attach the profile group so the allow rule gives no inspection; putting the deny rule above the allow rule (chapter 8).</p></div>
<div class="exam"><p><b>Exam trap.</b> App-ID identifies the application regardless of port; "application-default" restricts it to its normal ports. Exam questions about "which rule field blocks an application tunnelling over port 443" point to Application plus application-default service, not to a port-only rule.</p></div>

<div class="scn"><h4>The "any application" shortcut</h4><p>During an urgent onboarding, an engineer created an allow rule from the mobile user zone to trust with application any "just for today". Three weeks later a review of traffic logs showed file-sharing applications reaching a data-centre subnet that nobody had approved. The rule was replaced with named applications and the standard profile group, and a rule-hit review was added to the monthly checklist.</p><p><b>Lesson:</b> temporary wide rules become permanent. Name the application from day one.</p></div>

<div class="iv"><p class="q">"Why use App-ID instead of port-based rules?"</p><p>Ports can be used by any application. App-ID identifies the real application, so the rule allows what you intend and nothing riding on the same port. Mention application-default and profile groups on every allow rule.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A rule matches only when every field matches; the first matching rule decides.</li>
<li>Name applications and use application-default for the service.</li>
<li>Use zones and named address objects, not any.</li>
<li>Attach a profile group and a log setting to every allow rule.</li>
<li>Read the rule name column in the traffic log to see which line decided.</li>
</ul></div>
`,hi:`
<p>Purane firewalls us guard jaise the jo sirf door number dekhta hai: "port 443 khula hai, to kuch bhi guzar sakta hai". Lekin door number se pata nahi chalta ki andar kaun chal raha hai. App-ID wo guard hai jo insaan ko dekhta hai: "ye web browsing session hai", "ye storage service par file upload hai". Palo Alto Networks isse <b>App-ID</b> kehta hai: traffic ko uski asli pehchaan se identify kiya jata hai, bhale hi wo common port use kare. Aapke rules application ka naam likhte hain, isliye policy wahi kehti hai jo aap sach mein chahte ho.</p>

<h3>Security rule ki anatomy</h3>
<table class="cmp">
<tr><th>Field</th><th>Kya jawab deta hai</th><th>Good practice</th></tr>
<tr><td>Name</td><td>Ye rule kis liye hai?</td><td>Intent likho: <code>allow-mobile-to-hq-app</code>.</td></tr>
<tr><td>Source zone, source address</td><td>Flow kahan se aa raha hai?</td><td>Zone aur named address object use karo, jab pata ho to "any" nahi.</td></tr>
<tr><td>Source user, HIP</td><td>Kaun aur device ki kaisi state?</td><td>Aage ke chapters.</td></tr>
<tr><td>Destination zone, destination address</td><td>Kahan jaa raha hai?</td><td>Data centre ke liye trust, internet ke liye untrust.</td></tr>
<tr><td>Application</td><td>Asli mein kya hai?</td><td>Sirf wahi applications likho jo chahiye.</td></tr>
<tr><td>Service</td><td>Kaunse ports?</td><td>Application default safe choice hai.</td></tr>
<tr><td>Action</td><td>Allow ya deny</td><td>Neeche default deny rakho.</td></tr>
<tr><td>Profile group</td><td>Deep inspection</td><td>Har allow rule se attach karo.</td></tr>
<tr><td>Log setting</td><td>Records kahan jaate hain?</td><td>Session end par log karo, log forwarding profile attach karo.</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Rule match">
<rect x="10" y="20" width="95" height="50" rx="8" fill="#bae6fd"/><text x="57" y="50" text-anchor="middle" class="svg-ink" font-size="12">Source zone</text>
<rect x="115" y="20" width="95" height="50" rx="8" fill="#bae6fd"/><text x="162" y="50" text-anchor="middle" class="svg-ink" font-size="12">Source user</text>
<rect x="220" y="20" width="95" height="50" rx="8" fill="#bae6fd"/><text x="267" y="50" text-anchor="middle" class="svg-ink" font-size="12">Dest zone</text>
<rect x="325" y="20" width="95" height="50" rx="8" fill="#bae6fd"/><text x="372" y="50" text-anchor="middle" class="svg-ink" font-size="12">Dest address</text>
<rect x="430" y="20" width="95" height="50" rx="8" fill="#ddd6fe"/><text x="477" y="50" text-anchor="middle" class="svg-ink" font-size="12">Application</text>
<rect x="535" y="20" width="95" height="50" rx="8" fill="#ddd6fe"/><text x="582" y="50" text-anchor="middle" class="svg-ink" font-size="12">Service</text>
<text x="320" y="105" text-anchor="middle" class="svg-muted" font-size="12">Saare fields match hon, tab action aur profiles lagte hain</text>
<rect x="215" y="120" width="100" height="36" rx="8" fill="#bbf7d0"/><text x="265" y="143" text-anchor="middle" class="svg-ink" font-size="13">Allow</text>
<rect x="325" y="120" width="100" height="36" rx="8" fill="#fed7aa"/><text x="375" y="143" text-anchor="middle" class="svg-ink" font-size="13">Deny</text>
</svg><p class="cap">Rule tabhi match hota hai jab har field match kare. Pehla matching rule decide karta hai.</p></div>

<h3>Application default</h3>
<p>Service <b>application-default</b> ho to Prisma Access application ko sirf un ports par allow karta hai jo wo application normally use karta hai. Isse ek common trick rukti hai: disallowed application allowed port par chhup kar chalna. Service "any" chhodne se application kisi bhi port par chal sakti hai, jo shayad hi aap chahte ho.</p>

<h3>Worked example: lab ke pehle rules</h3>
<div class="eg"><p>Goal: mobile users (pool 10.200.0.0/23) HQ app 10.10.0.50 khol sakein, aur data centre mein aur kuch nahi. <code>hq-app</code> naam ka address object banao 10.10.0.50 ke liye, phir order mein do rules.</p></div>
<pre class="code"><span class="c"># Rule 1 (rule form ka teaching format)</span>
Name:               allow-mobile-to-hq-app
Source zone:        mobile users zone (as mapped in your tenant)
Source address:     10.200.0.0/23
Destination zone:   trust
Destination addr:   hq-app (10.10.0.50)
Application:        ssl, web-browsing
Service:            application-default
Action:             allow
Profile group:      corp-standard
Log:                at session end, forward via corp-logs

<span class="c"># Rule 2, Rule 1 ke neeche</span>
Name:               deny-other-internal
Destination zone:   trust
Application:        any
Action:             deny
Log:                at session end</pre>
<p>Rule 2 jaan boojh kar block karne mein narrow hai (sirf internal destinations) aur lagne mein wide hai (sab par). Isse "baaki internal destination denied" ek deliberate decision ban jata hai jo logs mein dikhta hai, accident nahi.</p>

<h3>Result kaisa dikhta hai</h3>
<pre class="out">Time      Src IP        Dst IP       App      Rule                     Action
11:02:14  10.200.0.7    10.10.0.50   ssl      <span class="hl">allow-mobile-to-hq-app</span>   allow
11:02:40  10.200.0.7    10.10.0.99   ssl      <span class="hl">deny-other-internal</span>      deny</pre>
<p>Rule name column har policy ticket mein sabse pehle padhne wali cheez hai. Wo batata hai kaunsi line ne decide kiya.</p>

<h3>First-packet aur application shift</h3>
<p>App-ID ko application pehchaanne ke liye kuch packets chahiye ho sakte hain. Session ke start mein firewall generic application se rule match kar sakta hai, aur application baad mein badal sakti hai (jaise ssl se kuch zyada specific). Isliye jo rules zyada specific application allow karte hain unhe, agar application ki documentation ko zaroorat ho, wo generic application bhi likhni chahiye jisse session shuru hota hai. Session expected se alag rule match kare to log ka application column dekho aur ye bhi ki wo kaise badla.</p>

<div class="warn"><p><b>Common mistakes.</b> Allow rule mein application any aur service any; application ka naam likhne ke bajay poora port khol dena; profile group attach na karna jisse allow rule koi inspection nahi deta; deny rule ko allow rule ke upar rakhna (chapter 8).</p></div>
<div class="exam"><p><b>Exam trap.</b> App-ID port ki parwah kiye bina application pehchaanta hai; "application-default" use uske normal ports tak limit karta hai. "Port 443 par tunnel hoti application ko kaun sa rule field rokta hai" jaise questions ka jawab Application plus application-default service hai, sirf port wala rule nahi.</p></div>

<div class="scn"><h4>"Any application" shortcut</h4><p>Urgent onboarding ke dauran ek engineer ne "bas aaj ke liye" mobile user zone se trust tak application any ke saath allow rule banaya. Teen hafte baad traffic logs ki review mein file-sharing applications ek unapproved data-centre subnet tak pahunchti dikhi. Rule ko named applications aur standard profile group se replace kiya gaya, aur monthly checklist mein rule-hit review jodi gayi.</p><p><b>Lesson:</b> temporary wide rules permanent ban jaate hain. Pehle din se application ka naam likho.</p></div>

<div class="iv"><p class="q">"Port-based rules ke bajay App-ID kyun?"</p><p>Ports ko koi bhi application use kar sakti hai. App-ID asli application pehchaanta hai, isliye rule wahi allow karta hai jo aap chahte ho aur same port par sawaar kuch nahi. Application-default aur har allow rule par profile groups ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Rule tabhi match hota hai jab har field match kare; pehla matching rule decide karta hai.</li>
<li>Applications ke naam likho aur service ke liye application-default use karo.</li>
<li>Zones aur named address objects use karo, any nahi.</li>
<li>Har allow rule se profile group aur log setting attach karo.</li>
<li>Kaunsi line ne decide kiya ye dekhne ke liye traffic log ka rule name column padho.</li>
</ul></div>
`}};export{e as default};