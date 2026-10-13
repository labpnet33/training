var e={id:`local-users`,h:{en:`Local users and groups on the FortiGate`,hi:`FortiGate par local users aur groups`},body:{en:`
<p>The simplest identity source is the firewall itself. You create the account on the FortiGate, put it in a group, and use that group in a policy. There is no extra server to run, which makes local users handy for small sites, guest accounts, lab testing and emergency access. The price is that every account lives on every firewall that needs it, so it does not scale to hundreds of staff.</p>
<div class="note"><p><b>Reference only.</b> The simulator has no user or group tables. The configuration below is a <b>Reference configuration (not run in the simulator)</b>, and no output is shown. Passwords are obvious placeholders; never reuse them.</p></div>

<h3>Create a local user</h3>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
config user local
    edit "anita.sharma"
        set type password
        set passwd "ChangeMe-Placeholder-1"
        set status enable
    next
    edit "rohit.verma"
        set type password
        set passwd "ChangeMe-Placeholder-2"
        set status enable
    next
end</pre>
<p><code>type password</code> means the FortiGate checks the password itself. Other types point to an external server (LDAP, RADIUS), which the next chapters cover. A user with <code>status disable</code> cannot log in, which is the safe way to switch off an account without deleting its history.</p>

<h3>Create a group</h3>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
config user group
    edit "FINANCE-USERS"
        set group-type firewall
        set member "anita.sharma"
    next
    edit "STAFF"
        set group-type firewall
        set member "anita.sharma" "rohit.verma"
    next
end</pre>
<ul>
<li><code>group-type firewall</code> is the type used for policy authentication.</li>
<li><code>member</code> lists user names or other objects. Notice that a user can be in several groups.</li>
<li>Policies then use <code>set groups "FINANCE-USERS"</code>, as in the previous chapter.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Users to groups to policy">
<rect x="10" y="20" width="140" height="50" rx="10" fill="#bae6fd"/><text x="80" y="50" text-anchor="middle" class="svg-ink" font-size="13">anita.sharma</text>
<rect x="10" y="120" width="140" height="50" rx="10" fill="#bae6fd"/><text x="80" y="150" text-anchor="middle" class="svg-ink" font-size="13">rohit.verma</text>
<rect x="240" y="20" width="150" height="50" rx="10" fill="#ddd6fe"/><text x="315" y="50" text-anchor="middle" class="svg-ink" font-size="13">FINANCE-USERS</text>
<rect x="240" y="120" width="150" height="50" rx="10" fill="#ddd6fe"/><text x="315" y="150" text-anchor="middle" class="svg-ink" font-size="13">STAFF</text>
<rect x="480" y="70" width="150" height="50" rx="10" fill="#bbf7d0"/><text x="555" y="100" text-anchor="middle" class="svg-ink" font-size="13">Firewall policy</text>
<line x1="150" y1="45" x2="240" y2="45" stroke="#64748b" stroke-width="2"/><line x1="150" y1="50" x2="240" y2="140" stroke="#64748b" stroke-width="2"/><line x1="150" y1="145" x2="240" y2="145" stroke="#64748b" stroke-width="2"/><line x1="390" y1="45" x2="480" y2="90" stroke="#64748b" stroke-width="2"/><line x1="390" y1="145" x2="480" y2="100" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Users join groups; policies name the groups.</p></div>

<h3>Tuning the login behaviour</h3>
<p>A global setting controls how long an authenticated session stays valid before the user must log in again. On a real unit it sits under <code>config user setting</code>, with <code>auth-timeout</code> in minutes and a choice between idle and hard timeout. Short timeouts are safer on shared PCs; long ones are friendlier for personal laptops. Check the exact options with <code>?</code> on your version.</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
config user setting
    set auth-timeout 30
end</pre>

<div class="eg"><p><b>Worked example.</b> A clinic has one firewall and eight staff. The IT consultant creates eight local users, groups DOCTORS and RECEPTION, and two policies: doctors reach the records server, reception reaches only the booking tool. Adding a new doctor takes one <code>edit</code> and one group change. When the clinic grows to 80 staff, the consultant moves to LDAP so accounts are not typed in by hand.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Storing real passwords in scripts or tickets; leaving test accounts enabled after the project; creating a group and forgetting to put it in a policy; deleting a user who is still listed in a group or policy (the policy then lists an object that no longer exists); using one shared account for the whole team, which destroys accountability.</p></div>
<div class="exam"><p><b>Exam trap.</b> A user object by itself grants nothing. It must be a member of a group and the group must appear in an accepting policy. Also, group membership is separate from the user's password type: a user can be local (password on the FortiGate) or remote (checked on a server).</p></div>

<div class="scn"><h4>The account that never expired</h4><p>A contractor finished his project in March. His local account stayed enabled, still in the VENDOR group, and was found in a review in September. The team set <code>status disable</code> at once, removed him from the group, and added a quarterly review of local accounts. Logs confirmed no logins since March.</p><p><b>Lesson:</b> local accounts need an owner and a review date.</p></div>

<div class="iv"><p class="q">"When would you use local users instead of LDAP?"</p><p>For small sites, guests, test or break-glass accounts, where running a directory is more work than the benefit. For many users or staff turnover, a central source is better, because accounts and groups are managed once. Mention that local accounts still need password policy, disabling when people leave, and regular review.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Local users live on the FortiGate: <code>config user local</code>.</li>
<li>Groups (<code>config user group</code>, type firewall) are what policies use.</li>
<li>Disable accounts with <code>status disable</code> instead of deleting history.</li>
<li>Local accounts do not scale; plan a move to LDAP or RADIUS as you grow.</li>
</ul></div>
`,hi:`
<p>Sabse simple identity source firewall khud hai. Aap FortiGate par account banate ho, use group mein daalte ho, aur policy mein woh group use karte ho. Koi extra server nahi chalana padta, isliye local users chhote sites, guest accounts, lab testing aur emergency access ke liye kaam ke hain. Keemat yeh hai ki har account har us firewall par rehta hai jise uski zaroorat ho, isliye sainkdon staff ke liye scale nahi karta.</p>
<div class="note"><p><b>Reference only.</b> Simulator mein user ya group tables nahi hain. Neeche ki configuration <b>Reference configuration (not run in the simulator)</b> hai, aur koi output nahi dikhaya gaya. Passwords obvious placeholders hain; unhe kabhi reuse mat karo.</p></div>

<h3>Local user banana</h3>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
config user local
    edit "anita.sharma"
        set type password
        set passwd "ChangeMe-Placeholder-1"
        set status enable
    next
    edit "rohit.verma"
        set type password
        set passwd "ChangeMe-Placeholder-2"
        set status enable
    next
end</pre>
<p><code>type password</code> ka matlab FortiGate khud password check karta hai. Doosre types external server (LDAP, RADIUS) ki taraf point karte hain, jo agle chapters mein aayenge. <code>status disable</code> wala user login nahi kar sakta, jo account ki history delete kiye bina use band karne ka safe tareeka hai.</p>

<h3>Group banana</h3>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
config user group
    edit "FINANCE-USERS"
        set group-type firewall
        set member "anita.sharma"
    next
    edit "STAFF"
        set group-type firewall
        set member "anita.sharma" "rohit.verma"
    next
end</pre>
<ul>
<li><code>group-type firewall</code> policy authentication ke liye use hone wala type hai.</li>
<li><code>member</code> user names ya doosre objects list karta hai. Dhyan do ki ek user kai groups mein ho sakta hai.</li>
<li>Policies phir pichle chapter ki tarah <code>set groups "FINANCE-USERS"</code> use karti hain.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Users to groups to policy">
<rect x="10" y="20" width="140" height="50" rx="10" fill="#bae6fd"/><text x="80" y="50" text-anchor="middle" class="svg-ink" font-size="13">anita.sharma</text>
<rect x="10" y="120" width="140" height="50" rx="10" fill="#bae6fd"/><text x="80" y="150" text-anchor="middle" class="svg-ink" font-size="13">rohit.verma</text>
<rect x="240" y="20" width="150" height="50" rx="10" fill="#ddd6fe"/><text x="315" y="50" text-anchor="middle" class="svg-ink" font-size="13">FINANCE-USERS</text>
<rect x="240" y="120" width="150" height="50" rx="10" fill="#ddd6fe"/><text x="315" y="150" text-anchor="middle" class="svg-ink" font-size="13">STAFF</text>
<rect x="480" y="70" width="150" height="50" rx="10" fill="#bbf7d0"/><text x="555" y="100" text-anchor="middle" class="svg-ink" font-size="13">Firewall policy</text>
<line x1="150" y1="45" x2="240" y2="45" stroke="#64748b" stroke-width="2"/><line x1="150" y1="50" x2="240" y2="140" stroke="#64748b" stroke-width="2"/><line x1="150" y1="145" x2="240" y2="145" stroke="#64748b" stroke-width="2"/><line x1="390" y1="45" x2="480" y2="90" stroke="#64748b" stroke-width="2"/><line x1="390" y1="145" x2="480" y2="100" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Users groups mein judte hain; policies groups ka naam leti hain.</p></div>

<h3>Login behaviour tune karna</h3>
<p>Ek global setting control karti hai ki authenticated session kitni der valid rehta hai, uske baad user ko dobara login karna padta hai. Real unit par yeh <code>config user setting</code> ke neeche hota hai, <code>auth-timeout</code> minutes mein aur idle aur hard timeout ka choice ke saath. Shared PCs par chhote timeouts safe hain; personal laptops ke liye lambe timeouts aaraamdeh hain. Apne version par exact options <code>?</code> se check karo.</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
config user setting
    set auth-timeout 30
end</pre>

<div class="eg"><p><b>Worked example.</b> Ek clinic mein ek firewall aur aath staff hain. IT consultant aath local users, groups DOCTORS aur RECEPTION, aur do policies banata hai: doctors records server tak jaate hain, reception sirf booking tool tak. Naya doctor add karne mein ek <code>edit</code> aur ek group change lagta hai. Jab clinic 80 staff tak badhti hai, consultant LDAP par chala jaata hai taaki accounts haath se type na karne padein.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Asli passwords scripts ya tickets mein rakhna; project ke baad test accounts enabled chhodna; group banakar use policy mein daalna bhool jaana; aise user ko delete karna jo abhi bhi group ya policy mein listed hai (policy phir aise object ko list karti hai jo hai hi nahi); poori team ke liye ek shared account use karna, jo accountability khatam kar deta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Sirf user object kuch grant nahi karta. Use group ka member hona hoga aur group ko accept karne wali policy mein dikhna hoga. Aur group membership user ke password type se alag hai: user local (password FortiGate par) ya remote (server par check) ho sakta hai.</p></div>

<div class="scn"><h4>Account jo kabhi expire nahi hua</h4><p>Ek contractor ne March mein project khatam kiya. Uska local account enabled raha, VENDOR group mein bana raha, aur September ke review mein mila. Team ne turant <code>status disable</code> kiya, use group se hataya, aur local accounts ka quarterly review add kiya. Logs ne confirm kiya ki March ke baad koi login nahi hua.</p><p><b>Lesson:</b> local accounts ka ek owner aur review date chahiye.</p></div>

<div class="iv"><p class="q">"LDAP ki jagah local users kab use karoge?"</p><p>Chhote sites, guests, test ya break-glass accounts ke liye, jahan directory chalana fayde se zyada kaam hai. Bahut users ya staff turnover ke liye central source behtar hai, kyunki accounts aur groups ek baar manage hote hain. Batao ki local accounts ko bhi password policy, log jaane par disable karna, aur regular review chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Local users FortiGate par rehte hain: <code>config user local</code>.</li>
<li>Groups (<code>config user group</code>, type firewall) policies use karti hain.</li>
<li>History delete karne ki jagah <code>status disable</code> se accounts band karo.</li>
<li>Local accounts scale nahi karte; badhne par LDAP ya RADIUS ka plan banao.</li>
</ul></div>
`}};export{e as default};