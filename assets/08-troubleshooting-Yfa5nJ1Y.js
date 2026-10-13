var e={id:`troubleshooting`,h:{en:`Troubleshooting remote access`,hi:`Remote access troubleshooting`},body:{en:`
<p>When a remote user says "the VPN does not work", you need a repeatable way to find the stage that fails. This chapter gives a workflow that works for SSL VPN and, with small changes, for IPsec dial-up. The commands are real FortiOS commands, <b>not run in the simulator</b>; because exact output depends on the version, I describe what to look for instead of printing sample output. For sniffer and debug flow practice see <b>nse4-diag</b>.</p>

<h3>The workflow: seven questions</h3>
<ol>
<li><b>Can the client reach the gateway at all?</b> From the client, check the gateway name resolves to the right public address and the port is open. On the FortiGate, a sniffer filtered on the client's source address and the VPN port shows whether packets arrive.</li>
<li><b>Does the TLS handshake succeed?</b> Certificate errors point to an expired or mismatched <code>servercert</code>, a missing intermediate CA, or a name that does not match the connection profile.</li>
<li><b>Does authentication succeed?</b> Check the event log for the login result and its reason. Test the user source directly with <code>diagnose test authserver</code> for LDAP or RADIUS where you have a test account. Verify group membership and that the user is not locked out.</li>
<li><b>Does MFA succeed?</b> Check that the token is assigned and active, the device time is correct, and RADIUS or the token service is reachable.</li>
<li><b>Does the user land on the right portal?</b> Compare the user's groups with the authentication-rule order.</li>
<li><b>Does the client get an address, DNS and routes?</b> Check the SSL VPN monitor for the assigned address, and the client for installed routes.</li>
<li><b>Is traffic routed and allowed?</b> Check the policy from the tunnel interface, the split-tunnel routes, DNS, the return route on the server and the session table.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Remote access troubleshooting">
<rect x="10" y="30" width="110" height="50" rx="10" fill="#bae6fd"/><text x="65" y="60" text-anchor="middle" class="svg-ink" font-size="12">1 Reach</text>
<rect x="135" y="30" width="110" height="50" rx="10" fill="#bbf7d0"/><text x="190" y="60" text-anchor="middle" class="svg-ink" font-size="12">2 TLS cert</text>
<rect x="260" y="30" width="110" height="50" rx="10" fill="#fde68a"/><text x="315" y="60" text-anchor="middle" class="svg-ink" font-size="12">3 Login</text>
<rect x="385" y="30" width="110" height="50" rx="10" fill="#fed7aa"/><text x="440" y="60" text-anchor="middle" class="svg-ink" font-size="12">4 MFA</text>
<rect x="510" y="30" width="120" height="50" rx="10" fill="#ddd6fe"/><text x="570" y="60" text-anchor="middle" class="svg-ink" font-size="12">5 Portal</text>
<rect x="135" y="100" width="170" height="50" rx="10" fill="#e2e8f0"/><text x="220" y="130" text-anchor="middle" class="svg-ink" font-size="12">6 Address, DNS, routes</text>
<rect x="335" y="100" width="170" height="50" rx="10" fill="#bae6fd"/><text x="420" y="130" text-anchor="middle" class="svg-ink" font-size="12">7 Policy and return path</text>
</svg><p class="cap">Find the first stage that fails and fix only that.</p></div>

<h3>Symptoms, causes and fixes</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th><th>Fix</th></tr>
<tr><td>Cannot connect, times out</td><td>Gateway not reachable, port blocked, source address restriction, wrong profile</td><td>Test the path; check <code>source-address</code>, port and listener interface</td></tr>
<tr><td>Certificate warning</td><td>Expired, wrong name, self-signed or missing intermediate</td><td>Install and select the correct certificate</td></tr>
<tr><td>Login rejected</td><td>Wrong password, user not in group, lockout, LDAP or RADIUS down</td><td>Check logs, group, lockout and the auth server</td></tr>
<tr><td>Token rejected</td><td>Out-of-sync token, unassigned token, time drift</td><td>Resync or reassign; check time on the device</td></tr>
<tr><td>Connected, wrong portal or no tunnel</td><td>Authentication rule order, group mismatch, portal modes</td><td>Fix the rule order and the portal</td></tr>
<tr><td>Connected, no access to servers</td><td>No policy, wrong objects, wrong split routes, missing return route</td><td>Fix policy, routes and the server return path</td></tr>
<tr><td>Names fail, addresses work</td><td>DNS not pushed or unreachable</td><td>Set and test the DNS servers</td></tr>
<tr><td>Everyone dropped at once</td><td>HA failover, firmware upgrade or certificate change</td><td>Check HA history and events; users reconnect</td></tr>
<tr><td>Slow or stalls</td><td>MTU, full-tunnel bandwidth, ISP quality</td><td>Adjust MSS, use split tunnelling, test the path</td></tr></table>

<h3>Useful commands</h3>
<pre class="code"><span class="c"># Reference commands (not run in the simulator)</span>
get vpn ssl monitor
show vpn ssl settings
show vpn ssl web portal
diagnose debug application sslvpn -1
diagnose debug enable
<span class="c"># ... reproduce one login attempt ...</span>
diagnose debug disable
diagnose debug reset

diagnose test authserver ldap "AD-SERVER" "user1" "Placeholder-Test-Password"
diagnose sniffer packet any 'host 203.0.113.50 and port 10443' 4</pre>
<p>Run the SSL VPN debug for one login only, because it can be verbose and may include sensitive details; keep the output out of tickets and chat. For IPsec dial-up, use the IKE tools from <b>nse4-ipsec</b> (<code>diagnose vpn ike gateway list</code>, the filtered IKE debug) in place of the SSL VPN debug.</p>

<h3>Work with the user</h3>
<p>Ask for the exact message, the time, the user's public address and whether other users are affected. One user failing points at the user, device or token; many users failing point at the gateway, certificate, authentication source or the network. The time of the first failure often matches a change window, a certificate expiry or a firmware upgrade.</p>

<div class="eg"><p><b>Worked example.</b> Several remote users get "login failed" from Monday morning. The event log shows authentication timeouts to the LDAP server. A test with <code>diagnose test authserver</code> also times out. The LDAP server's firewall had been changed over the weekend and no longer allowed the FortiGate's address. After restoring the rule, logins succeed. The SSL VPN settings never needed a change.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Changing the policy when the failure is at login. Posting debug output with usernames in a public chat. Restarting the service before collecting evidence. Forgetting that HA failover disconnects users.</p></div>
<div class="exam"><p><b>Exam trap.</b> The question may describe "connected but cannot reach internal servers" and offer authentication fixes among the options. Connected means authentication worked; look at policy, routes, DNS and the return path.</p></div>

<div class="scn"><h4>One user, one token</h4><p>A single user could not log in while colleagues could. The log showed password success and token failure. The user had recently replaced a phone, and the old token was still assigned. The administrator re-provisioned the token, and the user connected on the first try. No changes were needed on the gateway.</p><p><b>Lesson:</b> when one user fails, check the user-side items first.</p></div>

<div class="iv"><p class="q">"Users report they cannot connect to the VPN. How do you troubleshoot?"</p><p>I find out how many users are affected and when it started. Then I walk the stages: reach the gateway, TLS certificate, login, MFA, portal, address and routes, then policy and return path, using the event logs, the SSL VPN monitor, a sniffer and a one-login debug. One user usually means credentials or tokens; many users mean certificate, authentication source, HA or network.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Walk the stages in order and fix only the first one that fails.</li>
<li>Logs and the SSL VPN monitor show login results and assigned addresses.</li>
<li>Connected but no access points to policy, routes, DNS and return path.</li>
<li>One user suggests the user side; many suggest the gateway or its dependencies.</li>
<li>Keep debug short and protect the output.</li>
</ul></div>
`,hi:`
<p>Remote user kahe "VPN kaam nahi kar raha" to aapko repeatable tareeka chahiye ki kaunsa stage fail ho raha hai. Yeh chapter aisa workflow deta hai jo SSL VPN ke liye aur chhote badlaav ke saath IPsec dial-up ke liye bhi chalta hai. Commands asli FortiOS commands hain, <b>simulator mein nahi chalaye gaye</b>; exact output version par depend karta hai, isliye sample output print karne ke bajaye batata hoon ki kya dekhna hai. Sniffer aur debug flow ki practice ke liye <b>nse4-diag</b> dekho.</p>

<h3>Workflow: saat sawaal</h3>
<ol>
<li><b>Kya client gateway tak pahunch sakta hai?</b> Client se check karo ki gateway ka naam sahi public address par resolve hota hai aur port khula hai. FortiGate par client ke source address aur VPN port par filter kiya sniffer dikhata hai ki packets aa rahe hain ya nahi.</li>
<li><b>Kya TLS handshake succeed hota hai?</b> Certificate errors expired ya mismatched <code>servercert</code>, missing intermediate CA, ya connection profile se na milte naam ki taraf ishara karte hain.</li>
<li><b>Kya authentication succeed hota hai?</b> Login result aur uska karan ke liye event log dekho. Jahan test account ho wahan LDAP ya RADIUS ke liye user source ko seedhe <code>diagnose test authserver</code> se test karo. Group membership aur lockout check karo.</li>
<li><b>Kya MFA succeed hota hai?</b> Check karo ki token assigned aur active hai, device ka time sahi hai, aur RADIUS ya token service reachable hai.</li>
<li><b>Kya user sahi portal par pahunchta hai?</b> User ke groups ko authentication-rule order se compare karo.</li>
<li><b>Kya client ko address, DNS aur routes milte hain?</b> Assigned address ke liye SSL VPN monitor aur installed routes ke liye client check karo.</li>
<li><b>Kya traffic routed aur allowed hai?</b> Tunnel interface se policy, split-tunnel routes, DNS, server par return route aur session table check karo.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Remote access troubleshooting">
<rect x="10" y="30" width="110" height="50" rx="10" fill="#bae6fd"/><text x="65" y="60" text-anchor="middle" class="svg-ink" font-size="12">1 Reach</text>
<rect x="135" y="30" width="110" height="50" rx="10" fill="#bbf7d0"/><text x="190" y="60" text-anchor="middle" class="svg-ink" font-size="12">2 TLS cert</text>
<rect x="260" y="30" width="110" height="50" rx="10" fill="#fde68a"/><text x="315" y="60" text-anchor="middle" class="svg-ink" font-size="12">3 Login</text>
<rect x="385" y="30" width="110" height="50" rx="10" fill="#fed7aa"/><text x="440" y="60" text-anchor="middle" class="svg-ink" font-size="12">4 MFA</text>
<rect x="510" y="30" width="120" height="50" rx="10" fill="#ddd6fe"/><text x="570" y="60" text-anchor="middle" class="svg-ink" font-size="12">5 Portal</text>
<rect x="135" y="100" width="170" height="50" rx="10" fill="#e2e8f0"/><text x="220" y="130" text-anchor="middle" class="svg-ink" font-size="12">6 Address, DNS, routes</text>
<rect x="335" y="100" width="170" height="50" rx="10" fill="#bae6fd"/><text x="420" y="130" text-anchor="middle" class="svg-ink" font-size="12">7 Policy aur return path</text>
</svg><p class="cap">Pehla fail hone wala stage dhoondho aur sirf wahi theek karo.</p></div>

<h3>Symptoms, causes aur fixes</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th><th>Fix</th></tr>
<tr><td>Connect nahi hota, time out</td><td>Gateway reachable nahi, port blocked, source address restriction, galat profile</td><td>Path test karo; <code>source-address</code>, port aur listener interface check karo</td></tr>
<tr><td>Certificate warning</td><td>Expired, galat naam, self-signed ya missing intermediate</td><td>Sahi certificate install aur select karo</td></tr>
<tr><td>Login rejected</td><td>Galat password, user group mein nahi, lockout, LDAP ya RADIUS down</td><td>Logs, group, lockout aur auth server check karo</td></tr>
<tr><td>Token rejected</td><td>Out-of-sync token, unassigned token, time drift</td><td>Resync ya reassign; device ka time check karo</td></tr>
<tr><td>Connected, galat portal ya tunnel nahi</td><td>Authentication rule order, group mismatch, portal modes</td><td>Rule order aur portal theek karo</td></tr>
<tr><td>Connected, servers tak access nahi</td><td>Policy nahi, galat objects, galat split routes, return route missing</td><td>Policy, routes aur server return path theek karo</td></tr>
<tr><td>Naam fail, address chalte hain</td><td>DNS push nahi hua ya unreachable</td><td>DNS servers set aur test karo</td></tr>
<tr><td>Sab ek saath gir gaye</td><td>HA failover, firmware upgrade ya certificate change</td><td>HA history aur events check karo; users reconnect karte hain</td></tr>
<tr><td>Slow ya atakta hai</td><td>MTU, full-tunnel bandwidth, ISP quality</td><td>MSS adjust karo, split tunnelling use karo, path test karo</td></tr></table>

<h3>Useful commands</h3>
<pre class="code"><span class="c"># Reference commands (not run in the simulator)</span>
get vpn ssl monitor
show vpn ssl settings
show vpn ssl web portal
diagnose debug application sslvpn -1
diagnose debug enable
<span class="c"># ... ek login attempt reproduce karo ...</span>
diagnose debug disable
diagnose debug reset

diagnose test authserver ldap "AD-SERVER" "user1" "Placeholder-Test-Password"
diagnose sniffer packet any 'host 203.0.113.50 and port 10443' 4</pre>
<p>SSL VPN debug sirf ek login ke liye chalao, kyunki yeh verbose ho sakta hai aur sensitive details shamil kar sakta hai; output ko tickets aur chat se door rakho. IPsec dial-up ke liye SSL VPN debug ki jagah <b>nse4-ipsec</b> ke IKE tools (<code>diagnose vpn ike gateway list</code>, filtered IKE debug) use karo.</p>

<h3>User ke saath kaam karo</h3>
<p>Exact message, time, user ka public address aur doosre users affected hain ya nahi, poochho. Ek user fail ho to user, device ya token par shak; kai users fail hon to gateway, certificate, authentication source ya network par. Pehli failure ka time aksar change window, certificate expiry ya firmware upgrade se milta hai.</p>

<div class="eg"><p><b>Worked example.</b> Monday subah se kai remote users ko "login failed" milta hai. Event log LDAP server ke authentication timeouts dikhata hai. <code>diagnose test authserver</code> se test bhi time out hota hai. LDAP server ka firewall weekend mein badla gaya tha aur ab FortiGate ke address ko allow nahi karta tha. Rule restore karne ke baad logins succeed hote hain. SSL VPN settings mein kabhi badlaav ki zaroorat nahi padi.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Failure login par ho aur policy badalna. Usernames wala debug output public chat mein post karna. Evidence collect kiye bina service restart karna. Bhool jaana ki HA failover users ko disconnect karta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Question "connected lekin internal servers tak nahi pahunch sakta" describe kare aur options mein authentication fixes ho sakte hain. Connected ka matlab authentication kaam kiya; policy, routes, DNS aur return path dekho.</p></div>

<div class="scn"><h4>Ek user, ek token</h4><p>Ek user login nahi kar paaya jabki colleagues kar paaye. Log ne password success aur token failure dikhaya. User ne haal hi mein phone badla tha, aur purana token abhi bhi assigned tha. Administrator ne token dobara provision kiya, aur user pehli koshish mein connect ho gaya. Gateway par kuch badalna nahi pada.</p><p><b>Lesson:</b> ek user fail ho to pehle user-side items check karo.</p></div>

<div class="iv"><p class="q">"Users report karte hain ki VPN se connect nahi ho paate. Troubleshoot kaise karoge?"</p><p>Main pata karta hoon ki kitne users affected hain aur kab se. Phir stages walk karta hoon: gateway reach, TLS certificate, login, MFA, portal, address aur routes, phir policy aur return path, event logs, SSL VPN monitor, sniffer aur one-login debug se. Ek user aam taur par credentials ya tokens; kai users certificate, authentication source, HA ya network.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Stages kram se walk karo aur sirf pehla fail hone wala theek karo.</li>
<li>Logs aur SSL VPN monitor login results aur assigned addresses dikhate hain.</li>
<li>Connected lekin access nahi, to policy, routes, DNS aur return path.</li>
<li>Ek user user-side; kai users gateway ya uski dependencies.</li>
<li>Debug chhota rakho aur output ko protect karo.</li>
</ul></div>
`}};export{e as default};