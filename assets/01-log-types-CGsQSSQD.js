var e={id:`log-types`,h:{en:`The log types: traffic, UTM and event`,hi:`Log types: traffic, UTM aur event`},body:{en:`
<div class="note"><p><b>What you will learn.</b> The three families of logs that a FortiGate sends to a FortiAnalyzer (traffic, UTM and event), what each one records, how a traffic log and a UTM log of the same session are linked, and which of them the simulator really produces.</p><p><b>Prerequisites.</b> The module on log flow and device registration: a FortiGate that sends logs to FAZ-1 (192.0.2.6) and is registered, so that its logs are stored. Basic FortiGate policy knowledge.</p></div>

<p>Think of a shop in Chennai. There is a camera at the door that records everybody who enters and leaves, there is a security guard who writes down "stopped a man carrying a banned item", and there is a manager's diary that says "price list changed at 10:05". Three different records, three different questions. A FortiGate also keeps three families of logs, and Log View on the FortiAnalyzer is the place where you search all of them.</p>

<h3>Step 1: traffic logs, one line per session</h3>
<p>A <b>session</b> is one conversation between two hosts, for example one browser request from PC-HQ to SRV-WEB. When a firewall policy decides about a session, the FortiGate can write a <b>traffic log</b>: who started it, where it went, which policy decided and whether it was allowed. In the log the type is <code>traffic</code> and the subtype is <code>forward</code> (traffic that passes through the firewall). Whether the log is written depends on the <code>logtraffic</code> setting of the policy, which is covered in chapter 5.</p>

<h3>Step 2: UTM logs, the verdict of a security profile</h3>
<p><b>UTM</b> means unified threat management: the security profiles that inspect a session. In this module you meet four: web filter, application control, IPS (intrusion prevention) and antivirus. When a profile reaches a verdict, such as "this is BitTorrent and the list says block", the FortiGate writes a <b>UTM log</b> with type <code>utm</code> and a subtype such as <code>app-ctrl</code>. A UTM log answers "why was it stopped or flagged", which the traffic log alone cannot tell you.</p>

<h3>Step 3: event logs, what happened to the device</h3>
<p><b>Event logs</b> are not about user sessions. They record things that happen to the FortiGate itself: an administrator changed a setting, an interface went down, a VPN came up. In this simulator the event logs are <b>synthetic</b> and cover configuration changes only (an attribute configured, an object created). There are no interface, VPN or login events. In the real product there are many more event subtypes; the idea is the same.</p>

<h3>Step 4: the link between logs</h3>
<p>One user action can produce a traffic log and a UTM log. They share the field <code>sessionid</code>, and that is how you connect "the session was allowed to start" with "the profile then blocked it". Event logs have no session; they are tied to an administrator and an object instead.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Three log families">
<rect x="10" y="30" width="190" height="80" rx="8" fill="#bae6fd"/><text x="105" y="62" text-anchor="middle" class="svg-ink" font-size="14">Traffic log</text><text x="105" y="84" text-anchor="middle" class="svg-muted" font-size="12">one per session</text><text x="105" y="100" text-anchor="middle" class="svg-muted" font-size="12">policy decision</text>
<rect x="225" y="30" width="190" height="80" rx="8" fill="#ddd6fe"/><text x="320" y="62" text-anchor="middle" class="svg-ink" font-size="14">UTM log</text><text x="320" y="84" text-anchor="middle" class="svg-muted" font-size="12">profile verdict</text><text x="320" y="100" text-anchor="middle" class="svg-muted" font-size="12">app-ctrl, webfilter, ips, av</text>
<rect x="440" y="30" width="190" height="80" rx="8" fill="#fed7aa"/><text x="535" y="62" text-anchor="middle" class="svg-ink" font-size="14">Event log</text><text x="535" y="84" text-anchor="middle" class="svg-muted" font-size="12">device and admin changes</text><text x="535" y="100" text-anchor="middle" class="svg-muted" font-size="12">no session</text>
<line x1="200" y1="70" x2="225" y2="70" stroke="#64748b" stroke-width="2"/><text x="212" y="135" text-anchor="middle" class="svg-accent" font-size="12">same sessionid</text>
</svg><p class="cap">Traffic and UTM logs of one session share the sessionid; event logs stand alone.</p></div>

<h3>Why it matters</h3>
<p>Choosing the right type is the first filter of every search. If a user says "the firewall blocked my download", the reason is in a UTM log; if they say "the site was fine yesterday and broken today", the answer may be an event log showing who changed a policy. Searching the wrong type returns zero results and wastes time.</p>

<div class="eg"><p><b>Worked example.</b> On MDU-FGT the user at 10.20.0.10 starts a file-sharing client. The policy accepts the session and the application control list then blocks it. FAZ-1 stores two logs of the same session (sessionid 9081): a traffic log that carries <code>utmaction="block"</code> and a UTM log with <code>action="block"</code>. Shortened from a real run:</p></div>
<pre class="out">type="traffic" subtype="forward" level="notice" srcip=10.20.0.10 dstport=6881 sessionid=9081
  policyid=1 <span class="hl">action="accept" utmaction="block"</span> app="BitTorrent"
type="utm" subtype="app-ctrl" level="warning" srcip=10.20.0.10 dstport=6881 sessionid=9081
  applist="APP-BLOCK" appcat="P2P" app="BitTorrent" <span class="hl">action="block"</span></pre>
<p>An event log looks different. This one was written when an administrator changed the logging setting of a policy:</p>
<pre class="out">type="event" subtype="system" level="information" logdesc="Attribute configured"
  user="admin" cfgpath="firewall.policy" cfgobj="1" <span class="hl">cfgattr="logtraffic[all-&gt;disable]"</span></pre>

<p>The command to see them is <code>execute fazui logview root - all</code>. In the real product Log View is a GUI page; the simulator shows its result as text, and the command name <code>execute fazui</code> does not exist on a real FortiAnalyzer.</p>

<div class="warn"><p><b>Common mistakes.</b> Searching type <code>traffic</code> for a blocked application and concluding "nothing happened" when the verdict is only in the UTM log; expecting event logs about interfaces or VPN in the simulator; forgetting that the traffic log of a blocked-by-profile session says <code>accept</code>.</p></div>

<div class="exam"><p><b>Exam traps.</b> Traffic logs are written per session by the policy, UTM logs by the security profile, event logs by the system. The link between traffic and UTM logs is the session ID. A traffic log has level notice; a UTM log level depends on the feature.</p></div>

<div class="scn"><h4>The silent block</h4><p>A Madurai store manager said the file-sharing client "just hangs". The engineer searched traffic logs of MDU-FGT and found an accepted session to port 6881, so she first suspected the server. Then she opened the UTM logs for the same source IP and found an application control block for the same session ID.</p><p><b>Lesson:</b> an accepted traffic log does not mean the session worked; read the UTM log of the same session.</p></div>

<div class="iv"><p class="q">"What is the difference between traffic, UTM and event logs?"</p><p>Traffic logs record session decisions of the policy, UTM logs record verdicts of security profiles such as application control, and event logs record device and administrator events. Traffic and UTM logs of one session are linked by the session ID. Mention that you pick the type first when you search.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Traffic logs are per session and show the policy decision.</li>
<li>UTM logs show the verdict of web filter, application control, IPS or antivirus.</li>
<li>Event logs describe device changes; in the simulator they are synthetic and cover configuration changes only.</li>
<li>The sessionid links the traffic log and the UTM log of one session.</li>
<li>A session blocked by a profile can show action accept in the traffic log and utmaction block.</li>
</ul></div>
`,hi:`
<div class="note"><p><b>What you will learn.</b> Is chapter mein aap seekhoge ki FortiGate FortiAnalyzer ko kaun se teen log families bhejta hai (traffic, UTM aur event), har ek kya record karta hai, ek hi session ke traffic log aur UTM log kaise link hote hain, aur simulator inmein se kaun se really banata hai.</p><p><b>Prerequisites.</b> Log flow aur device registration wala module: ek FortiGate jo FAZ-1 (192.0.2.6) ko logs bhejta hai aur registered hai, taaki uske logs store hon. Basic FortiGate policy knowledge.</p></div>

<p>Chennai ki ek shop socho. Darwaze par camera hai jo har aane-jaane wale ko record karta hai, ek security guard hai jo likhta hai "banned item wale aadmi ko roka", aur manager ki diary hai jisme likha hai "10:05 par price list badli". Teen alag records, teen alag sawaal. FortiGate bhi teen families ke logs rakhta hai, aur FortiAnalyzer ka Log View wo jagah hai jahan aap sab mein search karte ho.</p>

<h3>Step 1: traffic logs, ek session ki ek line</h3>
<p><b>Session</b> do hosts ke beech ek conversation hai, jaise PC-HQ se SRV-WEB ko ek browser request. Jab firewall policy kisi session ke baare mein decide karti hai, FortiGate ek <b>traffic log</b> likh sakta hai: kisne start kiya, kahan gaya, kaun si policy ne decide kiya aur allow hua ya nahi. Log mein type <code>traffic</code> aur subtype <code>forward</code> hota hai (wo traffic jo firewall ke through guzarta hai). Log likha jayega ya nahi ye policy ki <code>logtraffic</code> setting par depend karta hai, jo chapter 5 mein aayega.</p>

<h3>Step 2: UTM logs, security profile ka verdict</h3>
<p><b>UTM</b> ka matlab unified threat management: wo security profiles jo session ko inspect karte hain. Is module mein chaar milte hain: web filter, application control, IPS (intrusion prevention) aur antivirus. Jab koi profile verdict deta hai, jaise "ye BitTorrent hai aur list kehti hai block", FortiGate type <code>utm</code> aur <code>app-ctrl</code> jaise subtype ke saath <b>UTM log</b> likhta hai. UTM log batata hai ki "kyun roka ya flag kiya", jo akela traffic log nahi bata sakta.</p>

<h3>Step 3: event logs, device ke saath kya hua</h3>
<p><b>Event logs</b> user sessions ke baare mein nahi hote. Wo FortiGate ke saath hone wali cheezein record karte hain: administrator ne setting badli, interface down hua, VPN up hua. Is simulator mein event logs <b>synthetic</b> hain aur sirf configuration changes cover karte hain (attribute configured, object created). Interface, VPN ya login events nahi hain. Real product mein bahut zyada event subtypes hote hain; idea wahi hai.</p>

<h3>Step 4: logs ke beech ka link</h3>
<p>Ek user action traffic log aur UTM log dono bana sakta hai. Dono field <code>sessionid</code> share karte hain, aur isi se "session start hone di gayi" ko "profile ne phir block kiya" se jodte ho. Event logs ka session nahi hota; wo administrator aur object se bandhe hote hain.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Teen log families">
<rect x="10" y="30" width="190" height="80" rx="8" fill="#bae6fd"/><text x="105" y="62" text-anchor="middle" class="svg-ink" font-size="14">Traffic log</text><text x="105" y="84" text-anchor="middle" class="svg-muted" font-size="12">har session ka ek</text><text x="105" y="100" text-anchor="middle" class="svg-muted" font-size="12">policy decision</text>
<rect x="225" y="30" width="190" height="80" rx="8" fill="#ddd6fe"/><text x="320" y="62" text-anchor="middle" class="svg-ink" font-size="14">UTM log</text><text x="320" y="84" text-anchor="middle" class="svg-muted" font-size="12">profile ka verdict</text><text x="320" y="100" text-anchor="middle" class="svg-muted" font-size="12">app-ctrl, webfilter, ips, av</text>
<rect x="440" y="30" width="190" height="80" rx="8" fill="#fed7aa"/><text x="535" y="62" text-anchor="middle" class="svg-ink" font-size="14">Event log</text><text x="535" y="84" text-anchor="middle" class="svg-muted" font-size="12">device aur admin changes</text><text x="535" y="100" text-anchor="middle" class="svg-muted" font-size="12">koi session nahi</text>
<line x1="200" y1="70" x2="225" y2="70" stroke="#64748b" stroke-width="2"/><text x="212" y="135" text-anchor="middle" class="svg-accent" font-size="12">same sessionid</text>
</svg><p class="cap">Ek session ke traffic aur UTM logs sessionid share karte hain; event logs akele hote hain.</p></div>

<h3>Yeh kyun zaroori hai</h3>
<p>Sahi type chunna har search ka pehla filter hai. Agar user kehta hai "firewall ne meri download block kar di", to reason UTM log mein hai; agar kehta hai "site kal theek thi aur aaj kharab hai", to jawab event log mein ho sakta hai jo dikhata hai kisne policy badli. Galat type search karne par zero results aate hain aur time waste hota hai.</p>

<div class="eg"><p><b>Worked example.</b> MDU-FGT par 10.20.0.10 wala user file-sharing client start karta hai. Policy session accept karti hai aur application control list use block kar deti hai. FAZ-1 ek hi session (sessionid 9081) ke do logs store karta hai: ek traffic log jisme <code>utmaction="block"</code> hai aur ek UTM log jisme <code>action="block"</code> hai. Real run se shortened:</p></div>
<pre class="out">type="traffic" subtype="forward" level="notice" srcip=10.20.0.10 dstport=6881 sessionid=9081
  policyid=1 <span class="hl">action="accept" utmaction="block"</span> app="BitTorrent"
type="utm" subtype="app-ctrl" level="warning" srcip=10.20.0.10 dstport=6881 sessionid=9081
  applist="APP-BLOCK" appcat="P2P" app="BitTorrent" <span class="hl">action="block"</span></pre>
<p>Event log alag dikhta hai. Ye tab likha gaya jab administrator ne policy ki logging setting badli:</p>
<pre class="out">type="event" subtype="system" level="information" logdesc="Attribute configured"
  user="admin" cfgpath="firewall.policy" cfgobj="1" <span class="hl">cfgattr="logtraffic[all-&gt;disable]"</span></pre>

<p>Inhe dekhne ka command hai <code>execute fazui logview root - all</code>. Real product mein Log View ek GUI page hai; simulator uska result text mein dikhata hai, aur <code>execute fazui</code> naam real FortiAnalyzer par exist nahi karta.</p>

<div class="warn"><p><b>Common mistakes.</b> Blocked application ke liye type <code>traffic</code> search karke "kuch nahi hua" maan lena jabki verdict sirf UTM log mein hai; simulator mein interface ya VPN ke event logs expect karna; ye bhoolna ki profile se blocked session ka traffic log <code>accept</code> kehta hai.</p></div>

<div class="exam"><p><b>Exam traps.</b> Traffic logs policy har session par likhti hai, UTM logs security profile, event logs system. Traffic aur UTM logs ka link session ID hai. Traffic log ka level notice hota hai; UTM log ka level feature par depend karta hai.</p></div>

<div class="scn"><h4>Khamosh block</h4><p>Madurai ke store manager ne kaha ki file-sharing client "bas hang ho jata hai". Engineer ne MDU-FGT ke traffic logs search kiye aur port 6881 ka accepted session mila, to pehle usne server par shak kiya. Phir usne same source IP ke UTM logs khole aur same session ID ka application control block mila.</p><p><b>Lesson:</b> accepted traffic log ka matlab ye nahi ki session chala; same session ka UTM log padho.</p></div>

<div class="iv"><p class="q">"Traffic, UTM aur event logs mein kya difference hai?"</p><p>Traffic logs policy ke session decisions record karte hain, UTM logs application control jaise security profiles ke verdicts, aur event logs device aur administrator events. Ek session ke traffic aur UTM logs session ID se linked hote hain. Ye bhi bolo ki search mein pehle type chunte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Traffic logs har session ke hote hain aur policy decision dikhate hain.</li>
<li>UTM logs web filter, application control, IPS ya antivirus ka verdict dikhate hain.</li>
<li>Event logs device changes batate hain; simulator mein wo synthetic hain aur sirf configuration changes cover karte hain.</li>
<li>sessionid ek session ke traffic log aur UTM log ko link karta hai.</li>
<li>Profile se blocked session traffic log mein action accept aur utmaction block dikha sakta hai.</li>
</ul></div>
`}};export{e as default};