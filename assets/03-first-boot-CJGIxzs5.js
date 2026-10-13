var e={id:`first-boot`,h:{en:`First boot: factory state, hostname and administrators`,hi:`First boot: factory state, hostname aur administrators`},body:{en:`
<p>A FortiGate straight from the box has a factory configuration. On hardware models this normally includes a default management address and an <code>admin</code> account, and current releases make you set a password at the first login. The exact defaults differ by model and release, so read the quick start guide for your model; the habit that matters is to <b>change what is default and close what is open</b> before the device meets a network.</p>
<h3>Reaching the device the first time</h3>
<ul>
<li><b>Console cable.</b> Always works, even with no IP address. Use it for the very first setup and for recovery.</li>
<li><b>GUI over the management or LAN port.</b> Connect a laptop in the same subnet as the default address, then browse to it.</li>
<li><b>SSH.</b> Works once an interface has an address and allows SSH.</li>
</ul>
<p>In the NK-OS lab the FortiGate starts with no addresses at all, which is the simplest factory-style state. Here is what the empty device looks like, in real simulator output:</p>
<pre class="code">FGT1 # get system status</pre>
<pre class="out">Version: FortiGate-VM64 v7.4.4,build2662,240514 (GA.F) - NK-OS educational simulator
Hostname: <span class="hl">FGT1</span>
Operation Mode: NAT
Current virtual domain: root
Max number of virtual domains: 1
Current HA mode: standalone</pre>
<pre class="code">FGT1 # get router info routing-table all</pre>
<pre class="out">Routing table for VRF=0</pre>
<pre class="code">FGT1 # show firewall policy</pre>
<pre class="out">config firewall policy
end</pre>
<p>The routing table has no routes, the policy table is empty and every port is unaddressed. The simulator banner shows its own release number; the track targets FortiOS 7.6 and the behaviour taught here is the same across 7.x.</p>
<h3>Naming the device</h3>
<p>The hostname lives in <code>config system global</code>. Set it first so prompts, logs and monitoring show a meaningful name. It takes effect at once:</p>
<pre class="code">FGT1 # config system global
FGT1 (global) # set hostname NK-PUNE-FGT
FGT1 (global) # end
NK-PUNE-FGT # get system global</pre>
<pre class="out">hostname            : NK-PUNE-FGT
alias               : 
admintimeout        : 5
admin-sport         : 443
admin-ssh-port      : 22</pre>
<p>That output also shows three administrator-related globals: <code>admintimeout</code> (idle minutes before an admin session logs out), <code>admin-sport</code> (the port of the HTTPS admin service) and <code>admin-ssh-port</code>. Changing the HTTPS admin port to a non-default one is a small hardening step, but it must also be allowed in firewall rules and in what users type in the browser.</p>
<h3>Administrators</h3>
<p>Administrator accounts are a separate table, <code>config system admin</code>. Each has a profile (what it may do) and can have <b>trusted hosts</b>, which restrict from which source addresses that account may log in. The simulator does not model this table, so here is a reference configuration (not run in the simulator):</p>
<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
config system admin
    edit "nk-admin"
        set accprofile "super_admin"
        set password ChangeMe-Placeholder-1
        set trusthost1 10.0.1.0 255.255.255.0
    next
end</pre>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Two gates: interface allowaccess and the admin trusted host"><rect x="10" y="40" width="130" height="60" rx="9" fill="#e2e8f0"/><text x="75" y="67" text-anchor="middle" class="svg-ink" font-size="13">Admin laptop</text><text x="75" y="84" text-anchor="middle" class="svg-muted" font-size="11">10.0.1.50</text><line x1="140" y1="70" x2="200" y2="70" stroke="#64748b" stroke-width="2"/><text x="170" y="62" text-anchor="middle" class="svg-accent" font-size="11">SSH / GUI</text><rect x="200" y="25" width="200" height="90" rx="9" fill="#fde68a"/><text x="300" y="67" text-anchor="middle" class="svg-ink" font-size="13">FortiGate</text><text x="300" y="84" text-anchor="middle" class="svg-muted" font-size="11">allowaccess + trusthost</text><line x1="400" y1="70" x2="470" y2="70" stroke="#64748b" stroke-width="2"/><rect x="470" y="40" width="150" height="60" rx="9" fill="#bbf7d0"/><text x="545" y="67" text-anchor="middle" class="svg-ink" font-size="13">Login allowed</text><text x="545" y="84" text-anchor="middle" class="svg-muted" font-size="11">only from trusted host</text></svg><p class="cap">Two gates: interface allowaccess and the admin trusted host</p></div>
<div class="eg"><p><b>Worked example.</b> The NOC laptop is 10.0.1.50. The admin account has trusthost1 10.0.1.0/24, so a login from 198.51.100.7 on the internet is refused even if the WAN accidentally allowed SSH. Two independent gates are better than one.</p></div>
<div class="warn"><p><b>Common mistake.</b> Leaving factory credentials and open management in place "until later". Management services reachable from the internet with default settings are one of the most commonly attacked exposures. Set the password, restrict trusted hosts and close WAN admin access on day one.</p></div>
<div class="exam"><p><b>Exam trap.</b> Know that hostname, admin ports and timeouts are in <code>config system global</code>, administrators in <code>config system admin</code>, and that a trusted host limits the source of the login, not the destination interface.</p></div>
<div class="scn"><h4>The unnamed firewall</h4><p>Three identical branch firewalls all kept the default hostname. When an alert arrived saying "FortiGate high CPU", the on-call engineer could not tell which branch it was and logged into the wrong one. A naming standard (site code plus role, such as NK-PUNE-FGT) set in the first minute of every deployment ended the confusion.</p><p><b>Lesson:</b> set a unique hostname before anything else; logs and alerts depend on it.</p></div>
<div class="iv"><p class="q">"What do you secure on a FortiGate before connecting it to a network?"</p><p>I change the default admin password or create a named admin and remove or lock the default, restrict admin logins with trusted hosts, allow management only on the interfaces that need it (not the WAN), set an idle admintimeout, and keep the firmware current. I back up the configuration once the baseline is done.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Use console for first setup; read your model quick start guide for defaults.</li>
<li>Factory state means no routes, no policy, unaddressed ports (as in the lab).</li>
<li>Hostname and admin ports live in config system global.</li>
<li>Admins have profiles and trusted hosts; combine with allowaccess for two gates.</li>
</ul></div>
`,hi:`
<p>Dabbe se nikla FortiGate factory configuration rakhta hai. Hardware models par ismein aam taur par ek default management address aur <code>admin</code> account hota hai, aur current releases pehle login par password set karwati hain. Exact defaults model aur release ke hisaab se alag hote hain, isliye apne model ki quick start guide padho; zaroori aadat yeh hai ki device ke network se milne se pehle <b>jo default hai use badlo aur jo khula hai use band karo</b>.</p>
<h3>Device tak pehli baar pahunchna</h3>
<ul>
<li><b>Console cable.</b> Hamesha kaam karta hai, IP address na ho tab bhi. Bilkul pehle setup aur recovery ke liye use karo.</li>
<li><b>Management ya LAN port par GUI.</b> Default address ke same subnet mein laptop jodo, phir browse karo.</li>
<li><b>SSH.</b> Tab kaam karta hai jab kisi interface par address ho aur woh SSH allow kare.</li>
</ul>
<p>NK-OS lab mein FortiGate bilkul bina addresses ke shuru hota hai, jo sabse saral factory-style state hai. Khali device simulator ke asli output mein aisa dikhta hai:</p>
<pre class="code">FGT1 # get system status</pre>
<pre class="out">Version: FortiGate-VM64 v7.4.4,build2662,240514 (GA.F) - NK-OS educational simulator
Hostname: <span class="hl">FGT1</span>
Operation Mode: NAT
Current virtual domain: root
Max number of virtual domains: 1
Current HA mode: standalone</pre>
<pre class="code">FGT1 # get router info routing-table all</pre>
<pre class="out">Routing table for VRF=0</pre>
<pre class="code">FGT1 # show firewall policy</pre>
<pre class="out">config firewall policy
end</pre>
<p>Routing table mein koi route nahi, policy table khali aur har port bina address ke. Simulator banner apna release number dikhata hai; track FortiOS 7.6 ko target karta hai aur yahan sikhaya behaviour 7.x mein same hai.</p>
<h3>Device ko naam dena</h3>
<p>Hostname <code>config system global</code> mein rehta hai. Ise pehle set karo taaki prompts, logs aur monitoring mein meaningful naam dikhe. Yeh turant lagu hota hai:</p>
<pre class="code">FGT1 # config system global
FGT1 (global) # set hostname NK-PUNE-FGT
FGT1 (global) # end
NK-PUNE-FGT # get system global</pre>
<pre class="out">hostname            : NK-PUNE-FGT
alias               : 
admintimeout        : 5
admin-sport         : 443
admin-ssh-port      : 22</pre>
<p>Is output mein teen administrator-related globals bhi dikhte hain: <code>admintimeout</code> (admin session ke logout hone se pehle idle minutes), <code>admin-sport</code> (HTTPS admin service ka port) aur <code>admin-ssh-port</code>. HTTPS admin port ko non-default karna chhota hardening step hai, par use firewall rules mein aur browser mein users jo type karte hain usme bhi allow karna padta hai.</p>
<h3>Administrators</h3>
<p>Administrator accounts alag table hain, <code>config system admin</code>. Har ek ka profile (kya kar sakta hai) hota hai aur <b>trusted hosts</b> ho sakte hain, jo restrict karte hain ki woh account kin source addresses se login kar sakta hai. Simulator is table ko model nahi karta, isliye reference configuration yeh hai (simulator mein run nahi hui):</p>
<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
config system admin
    edit "nk-admin"
        set accprofile "super_admin"
        set password ChangeMe-Placeholder-1
        set trusthost1 10.0.1.0 255.255.255.0
    next
end</pre>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Do gates: interface allowaccess aur admin trusted host"><rect x="10" y="40" width="130" height="60" rx="9" fill="#e2e8f0"/><text x="75" y="67" text-anchor="middle" class="svg-ink" font-size="13">Admin laptop</text><text x="75" y="84" text-anchor="middle" class="svg-muted" font-size="11">10.0.1.50</text><line x1="140" y1="70" x2="200" y2="70" stroke="#64748b" stroke-width="2"/><text x="170" y="62" text-anchor="middle" class="svg-accent" font-size="11">SSH / GUI</text><rect x="200" y="25" width="200" height="90" rx="9" fill="#fde68a"/><text x="300" y="67" text-anchor="middle" class="svg-ink" font-size="13">FortiGate</text><text x="300" y="84" text-anchor="middle" class="svg-muted" font-size="11">allowaccess + trusthost</text><line x1="400" y1="70" x2="470" y2="70" stroke="#64748b" stroke-width="2"/><rect x="470" y="40" width="150" height="60" rx="9" fill="#bbf7d0"/><text x="545" y="67" text-anchor="middle" class="svg-ink" font-size="13">Login allowed</text><text x="545" y="84" text-anchor="middle" class="svg-muted" font-size="11">sirf trusted host se</text></svg><p class="cap">Do gates: interface allowaccess aur admin trusted host</p></div>
<div class="eg"><p><b>Worked example.</b> NOC laptop 10.0.1.50 hai. Admin account ka trusthost1 10.0.1.0/24 hai, isliye internet se 198.51.100.7 ka login refuse ho jaata hai chahe WAN galti se SSH allow kar de. Do alag gates ek se behtar hain.</p></div>
<div class="warn"><p><b>Common mistake.</b> Factory credentials aur khula management "baad mein" tak chhod dena. Default settings ke saath internet se reachable management services sabse zyada attack hone wali exposures mein se hain. Pehle din password set karo, trusted hosts restrict karo aur WAN admin access band karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Yaad rakho ki hostname, admin ports aur timeouts <code>config system global</code> mein hain, administrators <code>config system admin</code> mein, aur trusted host login ke source ko limit karta hai, destination interface ko nahi.</p></div>
<div class="scn"><h4>Bina naam ka firewall</h4><p>Teen ek jaise branch firewalls ne default hostname rakha. Jab "FortiGate high CPU" alert aaya to on-call engineer bata nahi paya ki kaunsa branch hai aur galat wale mein login kar liya. Naming standard (site code plus role, jaise NK-PUNE-FGT) jo har deployment ke pehle minute mein set hota hai, confusion khatam kar gaya.</p><p><b>Lesson:</b> sabse pehle unique hostname set karo; logs aur alerts uspar nirbhar hain.</p></div>
<div class="iv"><p class="q">"Network se jodne se pehle FortiGate par kya secure karte ho?"</p><p>Main default admin password badalta hoon ya named admin banata hoon aur default ko hata ya lock karta hoon, admin logins ko trusted hosts se restrict karta hoon, management sirf un interfaces par allow karta hoon jinhe chahiye (WAN par nahi), idle admintimeout set karta hoon, aur firmware current rakhta hoon. Baseline hone par configuration ka backup leta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pehle setup ke liye console use karo; defaults ke liye apne model ki quick start guide padho.</li>
<li>Factory state matlab koi route nahi, koi policy nahi, bina address ke ports (lab ki tarah).</li>
<li>Hostname aur admin ports config system global mein hain.</li>
<li>Admins ke profiles aur trusted hosts hote hain; do gates ke liye allowaccess ke saath milao.</li>
</ul></div>
`}};export{e as default};