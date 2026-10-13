var e={id:`hardening`,h:{en:`Hardening and logging`,hi:`Hardening aur logging`},body:{en:`
<p>An SSL VPN gateway is reachable from the whole internet by design, which makes it one of the most scanned and attacked services on any network. Hardening is not optional. This chapter is written from the defender's point of view: what to configure, what to monitor and how to keep the service patched. Reference configuration is <b>not run in the simulator</b>.</p>

<h3>The hardening checklist</h3>
<ol>
<li><b>Patch quickly.</b> Remote access gateways have had serious vulnerabilities that were exploited soon after disclosure. Subscribe to the vendor's security advisories, test and apply firmware updates for your train promptly, and treat an advisory that mentions your VPN service as urgent.</li>
<li><b>MFA for every user.</b> Passwords are phished and reused. A second factor stops most credential attacks. Use FortiToken, a RADIUS or SAML MFA, or client certificates.</li>
<li><b>Limit who can reach the gateway.</b> Restrict <code>source-address</code> to the countries or ranges where staff actually are, or negate a list of countries you never use. Use a local-in policy for finer control. Remember that attackers also use local ranges, so this reduces noise but does not replace MFA.</li>
<li><b>Modern TLS only.</b> Allow TLS 1.2 and 1.3 and disable older protocol versions and weak ciphers. Use a certificate from a trusted CA.</li>
<li><b>Brute-force protection.</b> Limit login attempts and lock out for a period after failures.</li>
<li><b>Short sessions.</b> Set an idle timeout and a maximum session length so a stolen laptop or forgotten session does not stay open.</li>
<li><b>Least privilege.</b> One portal and one policy per group, with specific destinations and services.</li>
<li><b>Do not expose administration.</b> Keep the administration GUI and SSH off the internet-facing interface.</li>
<li><b>Log and alert.</b> Send VPN events to a central log system and alert on repeated failures, logins from unusual places and impossible travel.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Layers of defence">
<rect x="20" y="20" width="600" height="30" rx="6" fill="#bae6fd"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="12">Patch and monitor advisories</text>
<rect x="20" y="56" width="600" height="30" rx="6" fill="#bbf7d0"/><text x="320" y="76" text-anchor="middle" class="svg-ink" font-size="12">Limit source addresses, modern TLS, trusted certificate</text>
<rect x="20" y="92" width="600" height="30" rx="6" fill="#fde68a"/><text x="320" y="112" text-anchor="middle" class="svg-ink" font-size="12">Strong authentication: groups, MFA, lockout</text>
<rect x="20" y="128" width="600" height="30" rx="6" fill="#fed7aa"/><text x="320" y="148" text-anchor="middle" class="svg-ink" font-size="12">Least-privilege portal and policy, short sessions</text>
<rect x="20" y="164" width="600" height="24" rx="6" fill="#ddd6fe"/><text x="320" y="181" text-anchor="middle" class="svg-ink" font-size="12">Central logs and alerts</text>
</svg><p class="cap">No single control is enough; layers cover each other's gaps.</p></div>

<h3>Reference configuration (not run in the simulator)</h3>
<pre class="code"><span class="c"># Hardening-related SSL VPN settings (names as in FortiOS 7.x)</span>
config vpn ssl settings
    set ssl-min-proto-ver tls1-2
    set login-attempt-limit 3
    set login-block-time 300
    set idle-timeout 600
    set auth-timeout 28800
    set source-address "ALLOWED-COUNTRIES"
end</pre>
<p>The names and defaults for these settings differ a little between releases, so check <code>show vpn ssl settings</code> and the documentation for your version. <code>ALLOWED-COUNTRIES</code> is an address object (or group) of type geography that you create first. Idle timeout closes sessions that carry no traffic, and authentication timeout limits the total time before the user must log in again.</p>

<h3>Monitoring and logging</h3>
<p>Turn on logging for VPN events (user login success and failure, tunnel up and down, and the source address). Review them regularly and forward them to a central collector or SIEM. The commands <code>get vpn ssl monitor</code> (current users) and the GUI monitor for SSL VPN show who is connected, the tunnel address, the source address and the duration. Failed-login spikes from many addresses suggest password spraying, which MFA and lockouts mitigate. A successful login followed by an MFA prompt the user did not request suggests a stolen password.</p>

<h3>High availability and certificates</h3>
<p>If the FortiGate runs in an HA cluster (see <b>nse4-ha</b>), remember that SSL VPN sessions are not synchronised, so a failover disconnects users, who must log in again. Plan failover windows for maintenance and tell users what to expect. Certificates are synchronised with the rest of the configuration, but you must still renew them in time.</p>

<h3>Incident response basics</h3>
<p>If you suspect that an account is compromised, disable the user, end the session, force a password reset and a new MFA enrolment, review the logs for what that account reached, and check whether the same source address tried other accounts. After a gateway vulnerability announcement, patch first, then review for signs of earlier abuse and rotate the credentials stored on the device.</p>

<div class="eg"><p><b>Worked example.</b> The log shows 2,000 failed logins in an hour from many addresses against five usernames. This is password spraying. The administrator enables source-country restrictions, lowers the attempt limit, confirms that all accounts have MFA, and finds that one legacy account was exempt. That account is brought under MFA the same day, and the alert rule is tuned to fire on spikes.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Postponing firmware updates because "VPN works". Exempting the CEO or a service account from MFA. Leaving administration open on the same interface. Allowing TLS 1.0 for an old client. Ignoring logs until an incident.</p></div>
<div class="exam"><p><b>Exam trap.</b> Hardening questions often have an answer that says "change the port". Changing the port reduces noise but is not a security control; MFA, restricted sources, patching and least privilege are.</p></div>

<div class="scn"><h4>The advisory that was ignored for a month</h4><p>A vendor announced a critical flaw in the SSL VPN service. One company scheduled the update for "next quarter". Another patched within two days and reviewed logs for the preceding weeks. The first company later found unexplained sessions from unknown addresses and had to rebuild trust in every account.</p><p><b>Lesson:</b> patching an internet-facing VPN is an emergency task, not a routine one.</p></div>

<div class="iv"><p class="q">"How would you harden an SSL VPN?"</p><p>Patch promptly, require MFA for all users, restrict source addresses, allow only modern TLS with a trusted certificate, limit login attempts and session lengths, give each group a least-privilege portal and policy, keep administration off the public interface, and send logs to a central system with alerts. Where possible I would move to IPsec dial-up with certificates.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>An SSL VPN is internet-facing: patch fast and monitor advisories.</li>
<li>MFA, source restrictions, lockouts and modern TLS are the baseline.</li>
<li>Short idle and total session times limit exposure.</li>
<li>Central logging and alerts reveal spraying and stolen credentials.</li>
<li>Changing the port is not a security control.</li>
</ul></div>
`,hi:`
<p>SSL VPN gateway design se poore internet se reachable hota hai, isliye yeh kisi bhi network ki sabse zyada scan aur attack hone wali services mein se ek hai. Hardening optional nahi. Yeh chapter defender ke nazariye se likha hai: kya configure karna hai, kya monitor karna hai aur service ko patched kaise rakhna hai. Reference configuration <b>simulator mein nahi chalaye gaye</b>.</p>

<h3>Hardening checklist</h3>
<ol>
<li><b>Jaldi patch karo.</b> Remote access gateways mein gambhir vulnerabilities rahi hain jinhe disclosure ke jaldi baad exploit kiya gaya. Vendor ki security advisories subscribe karo, apni train ke firmware updates test karke jaldi apply karo, aur jis advisory mein aapki VPN service ka zikr ho use urgent maano.</li>
<li><b>Har user ke liye MFA.</b> Passwords phish aur reuse hote hain. Second factor zyadatar credential attacks rokta hai. FortiToken, RADIUS ya SAML MFA, ya client certificates use karo.</li>
<li><b>Gateway tak kaun pahunch sakta hai seemit karo.</b> <code>source-address</code> ko un countries ya ranges tak restrict karo jahan staff asal mein hai, ya un countries ki list negate karo jo aap kabhi use nahi karte. Finer control ke liye local-in policy use karo. Yaad rakho ki attackers local ranges bhi use karte hain, isliye yeh noise kam karta hai lekin MFA ki jagah nahi leta.</li>
<li><b>Sirf modern TLS.</b> TLS 1.2 aur 1.3 allow karo aur purane protocol versions aur weak ciphers disable karo. Trusted CA ka certificate use karo.</li>
<li><b>Brute-force protection.</b> Login attempts limit karo aur failures ke baad kuch der ke liye lockout karo.</li>
<li><b>Chhote sessions.</b> Idle timeout aur maximum session length set karo taaki chori hua laptop ya bhoola hua session khula na rahe.</li>
<li><b>Least privilege.</b> Har group ke liye ek portal aur ek policy, specific destinations aur services ke saath.</li>
<li><b>Administration expose mat karo.</b> Administration GUI aur SSH ko internet-facing interface se door rakho.</li>
<li><b>Log aur alert.</b> VPN events central log system ko bhejo aur baar-baar failures, unusual jagahon se logins aur impossible travel par alert karo.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Defence ki layers">
<rect x="20" y="20" width="600" height="30" rx="6" fill="#bae6fd"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="12">Patch karo aur advisories monitor karo</text>
<rect x="20" y="56" width="600" height="30" rx="6" fill="#bbf7d0"/><text x="320" y="76" text-anchor="middle" class="svg-ink" font-size="12">Source addresses limit, modern TLS, trusted certificate</text>
<rect x="20" y="92" width="600" height="30" rx="6" fill="#fde68a"/><text x="320" y="112" text-anchor="middle" class="svg-ink" font-size="12">Strong authentication: groups, MFA, lockout</text>
<rect x="20" y="128" width="600" height="30" rx="6" fill="#fed7aa"/><text x="320" y="148" text-anchor="middle" class="svg-ink" font-size="12">Least-privilege portal aur policy, chhote sessions</text>
<rect x="20" y="164" width="600" height="24" rx="6" fill="#ddd6fe"/><text x="320" y="181" text-anchor="middle" class="svg-ink" font-size="12">Central logs aur alerts</text>
</svg><p class="cap">Koi ek control kaafi nahi; layers ek-doosre ki gaps cover karti hain.</p></div>

<h3>Reference configuration (not run in the simulator)</h3>
<pre class="code"><span class="c"># Hardening se jude SSL VPN settings (naam FortiOS 7.x jaise)</span>
config vpn ssl settings
    set ssl-min-proto-ver tls1-2
    set login-attempt-limit 3
    set login-block-time 300
    set idle-timeout 600
    set auth-timeout 28800
    set source-address "ALLOWED-COUNTRIES"
end</pre>
<p>In settings ke naam aur defaults releases ke beech thode alag hote hain, isliye <code>show vpn ssl settings</code> aur apne version ka documentation check karo. <code>ALLOWED-COUNTRIES</code> geography type ka address object (ya group) hai jo aap pehle banate ho. Idle timeout bina traffic wale sessions band karta hai, aur authentication timeout user ke dobara login karne se pehle total time limit karta hai.</p>

<h3>Monitoring aur logging</h3>
<p>VPN events ke liye logging on karo (user login success aur failure, tunnel up aur down, aur source address). Unhe regularly review karo aur central collector ya SIEM ko forward karo. <code>get vpn ssl monitor</code> (current users) aur SSL VPN ka GUI monitor dikhate hain ki kaun connected hai, tunnel address, source address aur duration. Kai addresses se failed-login spikes password spraying ka ishara hain, jise MFA aur lockouts kam karte hain. Successful login ke baad user ne jo MFA prompt maanga nahi woh chori hue password ka ishara hai.</p>

<h3>High availability aur certificates</h3>
<p>FortiGate HA cluster mein chalta ho (<b>nse4-ha</b> dekho) to yaad rakho ki SSL VPN sessions synchronise nahi hote, isliye failover users ko disconnect karta hai, jinhe dobara login karna padta hai. Maintenance ke liye failover windows plan karo aur users ko batao ki kya expect karna hai. Certificates baaki configuration ke saath synchronise hote hain, lekin unhe time par renew phir bhi karna padta hai.</p>

<h3>Incident response basics</h3>
<p>Kisi account ke compromised hone ka shak ho to user ko disable karo, session khatam karo, password reset aur naya MFA enrolment force karo, logs mein dekho ki us account ne kya reach kiya, aur check karo ki same source address ne doosre accounts par koshish ki ya nahi. Gateway vulnerability announcement ke baad pehle patch karo, phir pehle ke abuse ke signs review karo aur device par stored credentials rotate karo.</p>

<div class="eg"><p><b>Worked example.</b> Log mein ek ghante mein paanch usernames ke khilaf kai addresses se 2,000 failed logins dikhte hain. Yeh password spraying hai. Administrator source-country restrictions enable karta hai, attempt limit kam karta hai, confirm karta hai ki saare accounts par MFA hai, aur dekhta hai ki ek legacy account exempt tha. Us account ko usi din MFA ke andar laya jaata hai, aur alert rule spikes par fire karne ke liye tune hota hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> "VPN chal raha hai" kehkar firmware updates taalna. CEO ya service account ko MFA se exempt karna. Same interface par administration khula chhodna. Purane client ke liye TLS 1.0 allow karna. Incident tak logs ignore karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Hardening questions mein aksar ek option hota hai "port badlo". Port badalne se noise kam hota hai lekin yeh security control nahi hai; MFA, restricted sources, patching aur least privilege hain.</p></div>

<div class="scn"><h4>Woh advisory jise ek mahine ignore kiya gaya</h4><p>Vendor ne SSL VPN service mein critical flaw announce kiya. Ek company ne update "agli quarter" ke liye schedule kiya. Doosri ne do din mein patch kiya aur pichle hafton ke logs review kiye. Pehli company ko baad mein unknown addresses se unexplained sessions mile aur har account par bharosa dobara banana pada.</p><p><b>Lesson:</b> internet-facing VPN ko patch karna emergency task hai, routine nahi.</p></div>

<div class="iv"><p class="q">"SSL VPN ko harden kaise karoge?"</p><p>Jaldi patch, sab users ke liye MFA, source addresses restrict, trusted certificate ke saath sirf modern TLS, login attempts aur session lengths limit, har group ke liye least-privilege portal aur policy, administration ko public interface se door, aur alerts ke saath central logging. Jahan ho sake main certificates ke saath IPsec dial-up par move karoonga.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SSL VPN internet-facing hai: jaldi patch karo aur advisories monitor karo.</li>
<li>MFA, source restrictions, lockouts aur modern TLS baseline hain.</li>
<li>Chhote idle aur total session times exposure kam karte hain.</li>
<li>Central logging aur alerts spraying aur chori hue credentials dikhate hain.</li>
<li>Port badalna security control nahi hai.</li>
</ul></div>
`}};export{e as default};