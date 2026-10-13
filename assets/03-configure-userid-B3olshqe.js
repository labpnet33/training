var e={id:`configure-userid`,h:{en:`Configuring User-ID: zones, service account and interface profile`,hi:`User-ID configure karna: zones, service account aur interface profile`},body:{en:`

<p><b>From idea to configuration.</b> This chapter lists everything you must set up for User-ID to work, in the right order, and shows the parts that the simulator can run. Because the lab has no directory and no agent, the directory-facing parts are shown as a checklist labelled reference.</p>

<h3>Analogy: opening a reception desk</h3>
<p>Before the receptionist can write names on badges you need: a desk in the right room (enable on the zone), a pass to read the sign-in sheet (a service account), a door she may use to talk to the guard (the interface setting that allows the User-ID service), and a list of which visitors count (include and exclude networks).</p>

<div class="dia"><svg viewBox="0 0 640 320" role="img" aria-label="Configuration order"><rect x="60" y="10" width="520" height="44" rx="9" fill="#bae6fd"/><text x="320" y="29" text-anchor="middle" class="svg-ink" font-size="13">1. Service account</text><text x="320" y="45" text-anchor="middle" class="svg-muted" font-size="11">least-privilege read access to the domain controllers</text><line x1="320" y1="54" x2="320" y2="70" stroke="#64748b" stroke-width="2"/><rect x="60" y="70" width="520" height="44" rx="9" fill="#bbf7d0"/><text x="320" y="89" text-anchor="middle" class="svg-ink" font-size="13">2. User-ID settings</text><text x="320" y="105" text-anchor="middle" class="svg-muted" font-size="11">server monitor, timeouts, include and exclude networks</text><line x1="320" y1="114" x2="320" y2="130" stroke="#64748b" stroke-width="2"/><rect x="60" y="130" width="520" height="44" rx="9" fill="#ddd6fe"/><text x="320" y="149" text-anchor="middle" class="svg-ink" font-size="13">3. Enable on the source zone</text><text x="320" y="165" text-anchor="middle" class="svg-muted" font-size="11">so sessions use the mappings</text><line x1="320" y1="174" x2="320" y2="190" stroke="#64748b" stroke-width="2"/><rect x="60" y="190" width="520" height="44" rx="9" fill="#fde68a"/><text x="320" y="209" text-anchor="middle" class="svg-ink" font-size="13">4. Interface profile</text><text x="320" y="225" text-anchor="middle" class="svg-muted" font-size="11">allow the User-ID service where agents connect</text><line x1="320" y1="234" x2="320" y2="250" stroke="#64748b" stroke-width="2"/><rect x="60" y="250" width="520" height="44" rx="9" fill="#fed7aa"/><text x="320" y="269" text-anchor="middle" class="svg-ink" font-size="13">5. Commit and verify</text><text x="320" y="285" text-anchor="middle" class="svg-muted" font-size="11">check the mapping table and a session</text></svg><p class="cap">Order of configuration for agentless User-ID.</p></div>

<h3>Step 1: the service account</h3>
<p>Create a dedicated domain account, with a very strong password stored in your vault, and give it only what it needs. For server monitoring this is typically membership of the <b>Event Log Readers</b> group (to read security events) and <b>Distributed COM Users</b>, plus remote management permissions on the domain controllers. It does <b>not</b> need to be a domain admin. A domain admin account here is a serious mistake, because its credentials sit on the firewall.</p>

<h3>Step 2: User-ID settings</h3>
<p>Reference configuration (not run in the simulator). In the GUI this is <b>Device &gt; User Identification &gt; User Mapping</b>. The firewall CLI has an equivalent tree, but you will normally use the GUI or Panorama for these objects.</p>
<table class="cmp"><tr><th>Setting</th><th>Typical value</th><th>Why</th></tr>
<tr><td>Server monitor</td><td>Each domain controller by name or address, type Microsoft Active Directory</td><td>Where to read logon events</td></tr>
<tr><td>Server log monitor frequency</td><td>Default (a few seconds)</td><td>How often logs are read</td></tr>
<tr><td>User-ID timeout</td><td>Default 45 minutes</td><td>How long a mapping is kept</td></tr>
<tr><td>Include networks</td><td>Corporate user ranges</td><td>Only map these</td></tr>
<tr><td>Exclude networks</td><td>Proxies, servers, NAT pools</td><td>Never map these</td></tr>
<tr><td>Probing</td><td>Off on modern networks</td><td>Active probing of clients is noisy and often blocked</td></tr>
</table>

<h3>Step 3: enable on the source zone</h3>
<p>Mappings are used only when the <b>source zone</b> has User-ID enabled. Enable it on zones where your users sit (trust, wireless, VPN), not on the internet zone.</p>

<h3>Step 4: let agents talk to the firewall</h3>
<p>If a Windows User-ID agent or another system sends mappings to the firewall, the interface it connects to needs the <b>User-ID</b> service in its interface management profile. Without it, the connection is refused. Notice that this is the same mechanism you saw for ping and SSH in pan-diag: a profile on the interface.</p>

<h3>Run it: the parts the simulator knows</h3>
<p>The simulator accepts the zone option and the interface profile, so you can practise those lines. This is real simulator output after the commands:</p>
<pre class="out">PA1&gt; configure
[edit]
PA1# set zone trust enable-user-identification yes
PA1# set network profiles interface-management-profile MGMT-UID userid-service yes
PA1# set network profiles interface-management-profile MGMT-UID ping yes
PA1# set network interface ethernet ethernet1/2 layer3 interface-management-profile MGMT-UID
PA1# commit

Commit job 4 is in progress. Use Ctrl+C to return to command prompt
......55%......75%.....98%.......100%
Configuration committed successfully</pre>
<p>Reading the configuration back shows the three pieces in place:</p>
<pre class="out">PA1# show
...
    ethernet1/2 {
        layer3 {
          ip {
            10.0.1.1/24;
          }
          <span class="hl">interface-management-profile MGMT-UID;</span>
        }
      }
...
      MGMT-UID {
        ping yes;
        <span class="hl">userid-service yes;</span>
      }
...
zone {
  trust {
    network {
      layer3 ethernet1/2;
    }
    <span class="hl">enable-user-identification yes;</span>
  }</pre>
<p>The simulator stores these settings, but it contains no identity source, so nothing creates mappings and sessions still show <code>src user: unknown</code>. What you practise here is the configuration syntax and the checks, not the result.</p>

<div class="eg"><p><b>Worked example.</b> A branch office has users on the trust zone and Windows domain controllers in the data center. The team creates the service account, adds both controllers as server monitors, sets include 10.0.0.0/16 and excludes the proxy 10.0.0.5, then enables User-ID on the trust zone. An hour later the mapping table lists hundreds of users, and group rules begin to match.</p></div>

<h3>Security of the service account</h3>
<ul>
<li>Use a dedicated account with the minimum rights. Never use an interactive admin account.</li>
<li>Prefer a long, random password kept in a password manager. In this course every password is a placeholder, never a real one.</li>
<li>Where possible, use encrypted communication to the directory (LDAPS in the next chapter).</li>
<li>Restrict who can edit the User-ID settings with administrator roles (see sec-aaa-mgmt).</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Enabling User-ID on the wrong zone. A common mistake is enabling it on untrust, which makes the firewall try to resolve identity for internet addresses, or forgetting trust so that nothing is ever used. Enable it on the zones where your users are the <b>source</b>.</p></div>
<div class="exam"><p><b>Exam trap.</b> There are two separate switches: the <b>User-ID service</b> on the interface management profile (so that agents can connect) and <b>Enable User Identification</b> on the zone (so that sessions use mappings). Exam items mix them on purpose.</p></div>

<div class="scn"><h4>Mappings existed but rules never matched</h4><p>A rule for the engineers group never matched, although the mapping table listed engineers. The team had configured the server monitor perfectly but forgot to enable User-ID on the zone the engineers used. One setting on the zone and a commit fixed it.</p><p><b>Lesson:</b> The mapping table can be right while sessions ignore it. Check the zone.</p></div>

<div class="iv"><p class="q">"What do you need to configure for agentless User-ID to work?"</p><p>A least-privilege service account, the domain controllers as server monitors, include and exclude networks, User-ID enabled on the source zone, and the User-ID service on the interface profile if agents connect to the firewall. Then I verify the mapping table and the src user in a session.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Use a dedicated least-privilege service account, never a domain admin.</li>
<li>Server monitors read domain controller logs; set include and exclude networks.</li>
<li>Enable User-ID on the source zone for sessions to use mappings.</li>
<li>The User-ID service on the interface management profile lets agents connect.</li>
<li>The simulator runs the zone and profile syntax but has no identity source.</li>
</ul></div>

`,hi:`

<p><b>Idea se configuration tak.</b> Yeh chapter woh sab batata hai jo User-ID chalane ke liye sahi order mein set karna hai, aur woh hisse dikhata hai jo simulator chala sakta hai. Lab mein directory aur agent nahi hai, isliye directory se juda hissa reference label ke saath checklist ke roop mein hai.</p>

<h3>Analogy: reception desk kholna</h3>
<p>Receptionist badges par naam likh sake, iske liye chahiye: sahi kamre mein desk (zone par enable), sign-in sheet padhne ka pass (service account), guard se baat karne ka darwaza (interface setting jo User-ID service allow kare), aur kaun se visitors count honge ki list (include aur exclude networks).</p>

<div class="dia"><svg viewBox="0 0 640 320" role="img" aria-label="Configuration order"><rect x="60" y="10" width="520" height="44" rx="9" fill="#bae6fd"/><text x="320" y="29" text-anchor="middle" class="svg-ink" font-size="13">1. Service account</text><text x="320" y="45" text-anchor="middle" class="svg-muted" font-size="11">domain controllers par least-privilege read access</text><line x1="320" y1="54" x2="320" y2="70" stroke="#64748b" stroke-width="2"/><rect x="60" y="70" width="520" height="44" rx="9" fill="#bbf7d0"/><text x="320" y="89" text-anchor="middle" class="svg-ink" font-size="13">2. User-ID settings</text><text x="320" y="105" text-anchor="middle" class="svg-muted" font-size="11">server monitor, timeouts, include aur exclude networks</text><line x1="320" y1="114" x2="320" y2="130" stroke="#64748b" stroke-width="2"/><rect x="60" y="130" width="520" height="44" rx="9" fill="#ddd6fe"/><text x="320" y="149" text-anchor="middle" class="svg-ink" font-size="13">3. Source zone par enable</text><text x="320" y="165" text-anchor="middle" class="svg-muted" font-size="11">taaki sessions mappings use karein</text><line x1="320" y1="174" x2="320" y2="190" stroke="#64748b" stroke-width="2"/><rect x="60" y="190" width="520" height="44" rx="9" fill="#fde68a"/><text x="320" y="209" text-anchor="middle" class="svg-ink" font-size="13">4. Interface profile</text><text x="320" y="225" text-anchor="middle" class="svg-muted" font-size="11">jahan agents connect hote hain wahan User-ID service allow</text><line x1="320" y1="234" x2="320" y2="250" stroke="#64748b" stroke-width="2"/><rect x="60" y="250" width="520" height="44" rx="9" fill="#fed7aa"/><text x="320" y="269" text-anchor="middle" class="svg-ink" font-size="13">5. Commit aur verify</text><text x="320" y="285" text-anchor="middle" class="svg-muted" font-size="11">mapping table aur session check karo</text></svg><p class="cap">Agentless User-ID ke configuration ka order.</p></div>

<h3>Step 1: service account</h3>
<p>Ek dedicated domain account banao, bahut strong password ke saath jo vault mein ho, aur sirf jitna chahiye utna do. Server monitoring ke liye aam taur par <b>Event Log Readers</b> group ki membership (security events padhne ke liye) aur <b>Distributed COM Users</b>, saath mein domain controllers par remote management permissions. Isse domain admin hona <b>zaroori nahi</b>. Yahan domain admin account lagana badi galti hai, kyunki uske credentials firewall par rehte hain.</p>

<h3>Step 2: User-ID settings</h3>
<p>Reference configuration (not run in the simulator). GUI mein yeh <b>Device &gt; User Identification &gt; User Mapping</b> hai. Firewall CLI mein equivalent tree hai, lekin in objects ke liye aap aam taur par GUI ya Panorama use karoge.</p>
<table class="cmp"><tr><th>Setting</th><th>Typical value</th><th>Kyun</th></tr>
<tr><td>Server monitor</td><td>Har domain controller naam ya address se, type Microsoft Active Directory</td><td>Logon events kahan se padhne hain</td></tr>
<tr><td>Server log monitor frequency</td><td>Default (kuch seconds)</td><td>Logs kitni baar padhe jaate hain</td></tr>
<tr><td>User-ID timeout</td><td>Default 45 minute</td><td>Mapping kitni der rakhi jaati hai</td></tr>
<tr><td>Include networks</td><td>Corporate user ranges</td><td>Sirf inhe map karo</td></tr>
<tr><td>Exclude networks</td><td>Proxies, servers, NAT pools</td><td>Inhe kabhi map mat karo</td></tr>
<tr><td>Probing</td><td>Modern networks par off</td><td>Clients ki active probing noisy hai aur aksar block hoti hai</td></tr>
</table>

<h3>Step 3: source zone par enable</h3>
<p>Mappings tabhi use hote hain jab <b>source zone</b> par User-ID enable ho. Use un zones par enable karo jahan aapke users baithe hain (trust, wireless, VPN), internet zone par nahi.</p>

<h3>Step 4: agents ko firewall se baat karne do</h3>
<p>Windows User-ID agent ya koi aur system firewall ko mappings bhejta hai to jis interface par woh connect hota hai uske interface management profile mein <b>User-ID</b> service chahiye. Iske bina connection refuse hota hai. Dhyan do ki yeh wahi mechanism hai jo pan-diag mein ping aur SSH ke liye dekha: interface par ek profile.</p>

<h3>Chalao: jo hissa simulator jaanta hai</h3>
<p>Simulator zone option aur interface profile accept karta hai, isliye woh lines practise kar sakte ho. Commands ke baad ka yeh asli simulator output hai:</p>
<pre class="out">PA1&gt; configure
[edit]
PA1# set zone trust enable-user-identification yes
PA1# set network profiles interface-management-profile MGMT-UID userid-service yes
PA1# set network profiles interface-management-profile MGMT-UID ping yes
PA1# set network interface ethernet ethernet1/2 layer3 interface-management-profile MGMT-UID
PA1# commit

Commit job 4 is in progress. Use Ctrl+C to return to command prompt
......55%......75%.....98%.......100%
Configuration committed successfully</pre>
<p>Configuration wapas padhne par teeno hisse jagah par dikhte hain:</p>
<pre class="out">PA1# show
...
    ethernet1/2 {
        layer3 {
          ip {
            10.0.1.1/24;
          }
          <span class="hl">interface-management-profile MGMT-UID;</span>
        }
      }
...
      MGMT-UID {
        ping yes;
        <span class="hl">userid-service yes;</span>
      }
...
zone {
  trust {
    network {
      layer3 ethernet1/2;
    }
    <span class="hl">enable-user-identification yes;</span>
  }</pre>
<p>Simulator yeh settings store karta hai, lekin usme koi identity source nahi hai, isliye mappings koi nahi banata aur sessions mein phir bhi <code>src user: unknown</code> dikhta hai. Yahan aap configuration syntax aur checks practise karte ho, result nahi.</p>

<div class="eg"><p><b>Worked example.</b> Ek branch office ke users trust zone par hain aur Windows domain controllers data center mein. Team service account banati hai, dono controllers ko server monitors mein jodti hai, include 10.0.0.0/16 set karti hai aur proxy 10.0.0.5 exclude karti hai, phir trust zone par User-ID enable karti hai. Ek ghante baad mapping table mein sau-hazaar users dikhte hain aur group rules match hone lagti hain.</p></div>

<h3>Service account ki security</h3>
<ul>
<li>Minimum rights waala dedicated account use karo. Kabhi interactive admin account nahi.</li>
<li>Lamba, random password password manager mein rakho. Is course mein har password placeholder hai, asli kabhi nahi.</li>
<li>Jahan ho sake directory se encrypted communication use karo (agle chapter mein LDAPS).</li>
<li>User-ID settings edit karne waalon ko administrator roles se restrict karo (sec-aaa-mgmt dekho).</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Galat zone par User-ID enable karna. Aam galti untrust par enable karna hai, jisse firewall internet addresses ki identity resolve karne ki koshish karta hai, ya trust bhool jaana taaki kuch kabhi use hi na ho. Use un zones par enable karo jahan aapke users <b>source</b> hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> Do alag switches hain: interface management profile par <b>User-ID service</b> (taaki agents connect kar sakein) aur zone par <b>Enable User Identification</b> (taaki sessions mappings use karein). Exam items inhe jaanbujhkar mix karte hain.</p></div>

<div class="scn"><h4>Mappings the lekin rules match nahi hui</h4><p>Engineers group ki rule kabhi match nahi hui, jabki mapping table mein engineers dikhte the. Team ne server monitor perfectly configure kiya tha lekin engineers jis zone par the wahan User-ID enable karna bhool gayi. Zone par ek setting aur commit se fix ho gaya.</p><p><b>Lesson:</b> Mapping table sahi ho sakta hai jabki sessions use ignore karein. Zone check karo.</p></div>

<div class="iv"><p class="q">"Agentless User-ID chalane ke liye kya configure karna padta hai?"</p><p>Least-privilege service account, domain controllers ko server monitors ke roop mein, include aur exclude networks, source zone par User-ID enabled, aur agents firewall se connect hon to interface profile par User-ID service. Phir mapping table aur session mein src user verify karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Dedicated least-privilege service account use karo, domain admin kabhi nahi.</li>
<li>Server monitors domain controller logs padhte hain; include aur exclude networks set karo.</li>
<li>Sessions ke mappings use karne ke liye source zone par User-ID enable karo.</li>
<li>Interface management profile ki User-ID service agents ko connect karne deti hai.</li>
<li>Simulator zone aur profile syntax chalata hai lekin identity source nahi hai.</li>
</ul></div>

`}};export{e as default};