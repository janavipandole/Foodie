import java.util.Scanner;

public class PasswordChecker {

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        System.out.print("🔑 Enter your password: ");
        String password = scanner.nextLine();

        String strength = evaluatePassword(password);
        System.out.println("Password Strength: " + strength);

        scanner.close();
    }

    public static String evaluatePassword(String password) {
        int score = 0;

        if (password.length() >= 8) score++;
        if (password.matches(".*[A-Z].*")) score++;
        if (password.matches(".*[a-z].*")) score++;
        if (password.matches(".*\\d.*")) score++;
        if (password.matches(".*[!@#$%^&*()].*")) score++;

        switch (score) {
            case 5: return "💪 Very Strong";
            case 4: return "👍 Strong";
            case 3: return "👌 Moderate";
            case 2: return "😬 Weak";
            default: return "❌ Very Weak";
        }
    }
}
