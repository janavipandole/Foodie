import java.io.Console;
import java.util.Arrays;
import java.util.List;
import java.util.Scanner;
import java.util.regex.*;

public class PasswordStrengthChecker {

    // ANSI colors
    private static final String RESET = "\u001B[0m";
    private static final String RED = "\u001B[31m";
    private static final String YELLOW = "\u001B[33m";
    private static final String GREEN = "\u001B[32m";

    // Simulated previous passwords for blacklist
    private static final List<String> previousPasswords = Arrays.asList(
        "Password123!", "Qwerty2023!", "Admin@123", "HelloWorld1!", "Test1234!"
    );

    // Common words to prevent using
    private static final List<String> commonWords = Arrays.asList(
        "username", "email", "admin", "user", "password"
    );

    public static void main(String[] args) {
        String password;
        String strength;

        System.out.println("🔐 Advanced Password Strength Checker\n");

        do {
            password = getPasswordInput();
            strength = evaluatePassword(password);
            System.out.println(strength);

            double entropy = calculateEntropy(password);
            System.out.printf("Entropy: %.2f bits\n\n", entropy);

        } while (!strength.contains("💪 Very Strong"));
    }

    // Get password input safely (masked if possible)
    public static String getPasswordInput() {
        Console console = System.console();
        String password;

        if (console != null) {
            char[] pwdArray = console.readPassword("🔑 Enter your password: ");
            password = new String(pwdArray);
        } else {
            Scanner scanner = new Scanner(System.in);
            System.out.print("🔑 Enter your password: ");
            password = scanner.nextLine();
        }

        return password;
    }

    // Evaluate password strength with advanced rules
    public static String evaluatePassword(String password) {
        int score = 0;
        StringBuilder suggestions = new StringBuilder();

        // Check blacklist
        if (previousPasswords.contains(password)) {
            return RED + "❌ Very Weak (Used Previously)" + RESET;
        }

        // Check for common words
        for (String word : commonWords) {
            if (password.toLowerCase().contains(word)) {
                return RED + "❌ Very Weak (Contains common word: " + word + ")" + RESET;
            }
        }

        // Minimum length
        if (password.length() >= 12) score += 2;
        else if (password.length() >= 8) score += 1;
        else suggestions.append("• Use at least 8-12 characters\n");

        // Uppercase, lowercase, number, special
        if (password.matches(".*[A-Z].*")) score++;
        else suggestions.append("• Add uppercase letters\n");

        if (password.matches(".*[a-z].*")) score++;
        else suggestions.append("• Add lowercase letters\n");

        if (password.matches(".*\\d.*")) score++;
        else suggestions.append("• Include numbers\n");

        if (password.matches(".*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?].*")) score++;
        else suggestions.append("• Add special characters (!@#$%^&*)\n");

        // Penalize repeated characters
        if (Pattern.compile("(.)\\1{2,}").matcher(password).find()) {
            score -= 1;
            suggestions.append("• Avoid repeating the same character 3+ times\n");
        }

        // Penalize sequences
        if (isSequential(password)) {
            score -= 1;
            suggestions.append("• Avoid sequential letters or numbers\n");
        }

        // Entropy bonus
        double entropy = calculateEntropy(password);
        if (entropy > 60) score += 2;
        else if (entropy > 50) score += 1;

        // Determine strength
        String strength;
        if (score >= 9) strength = GREEN + "💪 Very Strong" + RESET;
        else if (score >= 7) strength = GREEN + "👍 Strong" + RESET;
        else if (score >= 5) strength = YELLOW + "👌 Moderate" + RESET;
        else if (score >= 3) strength = RED + "😬 Weak" + RESET;
        else strength = RED + "❌ Very Weak" + RESET;

        // Add score explanation
        strength += " (Score: " + score + "/10)";

        // Add suggestions if not perfect
        if (!strength.contains("💪 Very Strong")) {
            strength += "\n\nSuggestions:\n" + suggestions;
        }

        return strength;
    }

    // Calculate entropy
    public static double calculateEntropy(String password) {
        int charsetSize = 0;
        if (password.matches(".*[a-z].*")) charsetSize += 26;
        if (password.matches(".*[A-Z].*")) charsetSize += 26;
        if (password.matches(".*\\d.*")) charsetSize += 10;
        if (password.matches(".*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?].*")) charsetSize += 32;

        if (charsetSize == 0) return 0;

        return password.length() * (Math.log(charsetSize) / Math.log(2));
    }

    // Detect sequential characters
    public static boolean isSequential(String password) {
        password = password.toLowerCase();
        for (int i = 0; i < password.length() - 2; i++) {
            char first = password.charAt(i);
            char second = password.charAt(i + 1);
            char third = password.charAt(i + 2);

            // ascending
            if (second == first + 1 && third == second + 1) return true;

            // descending
            if (second == first - 1 && third == second - 1) return true;
        }
        return false;
    }
}
