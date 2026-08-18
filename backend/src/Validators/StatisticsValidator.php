<?php

declare(strict_types=1);

namespace App\Validators;

use App\Exceptions\ApiException;
use Respect\Validation\Exceptions\ValidationException;
use Respect\Validation\Validator;

final class StatisticsValidator
{
    private const MINIMUM_RUN_ID_LENGTH = 1;

    private const MAXIMUM_RUN_ID_LENGTH = 64;

    // Deckel gegen einen kaputten Client, der die Tabelle sonst mit einem
    // einzigen Aufruf sprengt — eine Episode liefert realistisch wenige
    // Dutzend Ereignisse und Minuten, nie zehntausend.
    private const MAXIMUM_DELTA = 10000;

    /**
     * @return array{
     *   run_id: string,
     *   events_completed: int,
     *   correct_answers: int,
     *   wrong_answers: int,
     *   playtime_minutes: int,
     * }
     */
    public function validateAdd(array $requestBody): array
    {
        $deltaRule = Validator::optional(Validator::intType()->min(0)->max(self::MAXIMUM_DELTA));

        $rules = Validator::key(
            'run_id',
            Validator::stringType()->length(self::MINIMUM_RUN_ID_LENGTH, self::MAXIMUM_RUN_ID_LENGTH),
        )
            ->key('events_completed', $deltaRule, false)
            ->key('correct_answers', $deltaRule, false)
            ->key('wrong_answers', $deltaRule, false)
            ->key('playtime_minutes', $deltaRule, false);

        try {
            $rules->assert($requestBody);
        } catch (ValidationException $failure) {
            throw new ApiException(422, 'Die Statistik hat nicht das erwartete Format', $failure);
        }

        return [
            'run_id' => (string) $requestBody['run_id'],
            'events_completed' => (int) ($requestBody['events_completed'] ?? 0),
            'correct_answers' => (int) ($requestBody['correct_answers'] ?? 0),
            'wrong_answers' => (int) ($requestBody['wrong_answers'] ?? 0),
            'playtime_minutes' => (int) ($requestBody['playtime_minutes'] ?? 0),
        ];
    }
}
